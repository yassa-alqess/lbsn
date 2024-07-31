import { IServicesGetResponse } from "../services/services.interface";
import Service from "../../shared/models/service";
import GuestRequest from "../../shared/models/guest-request";
import GuestService from "../guests/guests.service";
import UserProfilesService from "../user-profiles/user-profiles.service";
import ProfileService from "../profiles/profiles.service";
import logger from "../../config/logger";
import { GuestNotFoundError, ProfileAlreadyExistsError, ServiceNotFoundError, UserAlreadyExistsError } from "../../shared/errors";



export default class GuestRequestsService {
    private _guestService = new GuestService();
    private _profileService = new ProfileService();
    private _userProfilesService = new UserProfilesService();
    public async addGuestRequest(guestId: string, requestId: string): Promise<void> {
        await GuestRequest.create({ guestId, serviceId: requestId });
    }

    public async getGuestRequests(guestId: string): Promise<IServicesGetResponse> {
        const guestRequests = await GuestRequest.findAll({ where: { guestId } });
        const requestsIds = guestRequests.map(request => request.serviceId);
        const serviceRecords = await Service.findAll({ where: { serviceId: requestsIds } });

        return { services: serviceRecords.map(service => ({ serviceId: service.serviceId, name: service.name })) };
    }

    public async deleteGuestRequest(guestId: string, requestId: string): Promise<void> {
        await GuestRequest.destroy({ where: { guestId, serviceId: requestId } });
    }

    public async approveGuestRequest(guestId: string, requestId: string): Promise<void> {
        const guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId: requestId } });
        if (!guestRequest) {
            throw new Error('Guest Request not found');
        }

        //update guest-service status
        await guestRequest.update({ resolved: true });

        // Add guest to users table (if not already exist)
        //send email to the user with the username and password [delegated to approveGuest service]
        // get user id as it will be used later to add profile to the user at user-profiles table
        let userId: string = "";
        try {
            userId = await this._guestService.approveGuest(guestId);
        } catch (err) {
            if (err instanceof GuestNotFoundError) {
                // Critical error, stop processing
                throw err;
            } else if (err instanceof UserAlreadyExistsError) {
                // Log and continue processing
                logger.info(err.message);
            } else {
                // Log and continue processing for other errors
                logger.error('Unknown error occurred', err);
            }
        }

        // fetch requst data
        const requstData = await Service.findOne({ where: { serviceId: requestId } });
        if (!requstData) {
            throw new ServiceNotFoundError("Service not found");
        }

        // create profile & add service/request data to profile (if not already exist) [call addProfile action from Profile Service]
        // get user id as it will be used later to add profile to the user at user-profiles table
        let profileId: string = "";
        try {
            const profile = await this._profileService.addProfile({ name: requstData.name });
            profileId = profile.profileId;
        } catch (err) {
            if (err instanceof ProfileAlreadyExistsError) {
                // Log and continue processing
                logger.info(err.message);
            } else {
                // Log and continue processing for other errors
                logger.error('Unknown error occurred', err);
            }
        }

        //add user profile record [call addUserProfile action from UserProfiles Service]
        try {
            await this._userProfilesService.addUserProfile(userId, profileId);
        } catch (err) {
            // Log and continue processing for other errors
            logger.error('Unknown error occurred', err);
        }

        //destroy guest-service record (mark record as approved) [soft delete]
        //destroy guest record (if no more services) [guest can be deleted as we can't gurante that he didn't request any other services]
        await guestRequest.update({ resolved: true });
        await guestRequest.save();
    }
}
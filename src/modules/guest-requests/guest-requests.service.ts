import Service from "../../shared/models/service";
import GuestRequest from "../../shared/models/guest-request";
import GuestService from "../guests/guests.service";
import UserProfilesService from "../user-profiles/user-profiles.service";
import logger from "../../config/logger";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IsResolvedEnum, MarketingBudgetEnum } from "../../shared/enums";
import { IgetGuestRequestsResponse, IGuestRequest, IGuestRequestAddPayload, IGuestRequestUpdatePayload } from "./guest-requests.interface";
import sequelize from "../../config/database/connection";

// 3rd party dependencies
import { Transaction } from "sequelize";


export default class GuestRequestsService {
    private _guestService = new GuestService();
    private _userProfilesService = new UserProfilesService();
    public async addGuestRequest(guestRequestPayload: IGuestRequestAddPayload): Promise<IGuestRequest> {
        const { guestId, requestId, marketingBudget } = guestRequestPayload;
        const guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId: requestId } });
        if (guestRequest) {
            throw new Error(`Guest request already exists`);
        }
        try {
            const newGuestRequest = await GuestRequest.create({
                guestId, serviceId: requestId, resolved: IsResolvedEnum.PENDING, marketingBudget
            });

            // Fetch the newly created guest request with the associated service
            const guestRequestWithService = await GuestRequest.findOne({
                where: { guestRequestId: newGuestRequest.guestRequestId },
                include: [{ model: Service, as: 'service' }] // Include the service data
            });

            if (!guestRequestWithService || !guestRequestWithService.service) {
                throw new Error("Service not found for the created guest request");
            }

            return {
                guestRequestId: newGuestRequest.guestRequestId,
                guestId: newGuestRequest.guestId,
                requestId: newGuestRequest.serviceId,
                name: newGuestRequest.service.name,
                status: newGuestRequest.resolved as IsResolvedEnum,
                marketingBudget: newGuestRequest.marketingBudget as MarketingBudgetEnum,
            }
        }
        //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error adding guest request: ${error.message}`);
            throw new Error(`Error adding guest request`);
        }
    }

    public async updateGuestRequest(guestRequestPayload: IGuestRequestUpdatePayload): Promise<IGuestRequest | undefined> {
        const { guestId, requestId, marketingBudget } = guestRequestPayload;
        const guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId: requestId } });
        if (!guestRequest) {
            throw new Error('Guest Request not found');
        }
        try {
            const nweGestRequest = await guestRequest.update({ marketingBudget });
            return {
                guestRequestId: nweGestRequest.guestRequestId,
                guestId: nweGestRequest.guestId,
                requestId: nweGestRequest.serviceId,
                name: nweGestRequest.service.name,
                status: nweGestRequest.resolved as IsResolvedEnum,
                marketingBudget: nweGestRequest.marketingBudget as MarketingBudgetEnum
            }
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating guest request: ${error.message}`);
            throw new Error(`Error updating guest request`);
        }
    }

    public async getGuestRequests(guestId: string): Promise<IgetGuestRequestsResponse | undefined> {
        const guestRequests = await GuestRequest.findAll({
            where: { guestId },
            include: [{
                model: Service,
                attributes: ['serviceId', 'name'],
            }],
        });

        const guestRequestsResponse: IGuestRequest[] = guestRequests.map(request => ({
            guestRequestId: request.guestRequestId,
            guestId: request.guestId,
            requestId: request.serviceId,
            name: request.service.name,
            status: request.resolved as IsResolvedEnum,
            marketingBudget: request.marketingBudget as MarketingBudgetEnum
        }));

        return { gestRequests: guestRequestsResponse };
    }

    public async deleteGuestRequest(guestId: string, requestId: string): Promise<void> {
        const guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId: requestId } });
        if (!guestRequest) {
            throw new Error(`couldn't fine the guest request`);
        }
        try {
            await GuestRequest.destroy({ where: { guestId, serviceId: requestId } });
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting guest request: ${error.message}`);
            throw new Error(`Error deleting guest request`);
        }
    }
    
    public async getGuestRequest(guestId: string, requestId: string): Promise<IGuestRequest | undefined> {
        const guestRequest = await GuestRequest.findOne({
            where: { guestId, serviceId: requestId },
            include: [{
                model: Service,
                attributes: ['serviceId', 'name'],
            }],
        });
        if (!guestRequest) {
            throw new Error(`Guest request not found`);
        }
        return {
            guestRequestId: guestRequest.guestRequestId,
            guestId: guestRequest.guestId,
            requestId: guestRequest.serviceId,
            name: guestRequest.service.name,
            status: guestRequest.resolved as IsResolvedEnum,
            marketingBudget: guestRequest.marketingBudget as MarketingBudgetEnum
        }
    }

    public async approveGuestRequest(guestId: string, requestId: string, txn?: Transaction): Promise<void> {
        const transaction = txn || await sequelize.transaction();

        try {
            const guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId: requestId }, transaction });
            if (!guestRequest) {
                throw new Error('Guest Request not found');
            }

            // Update guest-service status
            await guestRequest.update({ resolved: IsResolvedEnum.RESOLVED }, { transaction });

            // Add guest to users table (if not already exist)
            // Send email to the user with the username and password [delegated to approveGuest service]
            // Get user id as it will be used later to add profile to the user at user-profiles table
            let userId: string = "";
            try {
                userId = await this._guestService.approveGuest(guestId, transaction);
                //eslint-disable-next-line
            } catch (err: any) {
                if (err instanceof NotFoundException) {
                    // Critical error, stop processing
                    throw new Error(err.message);
                } else if (err instanceof AlreadyExistsException) {
                    // Log and continue processing
                    logger.info(err.message);
                } else {
                    // Log and continue processing for other errors
                    logger.error(`Couldn't approve the guest: ${err.message}`);
                    throw new Error(`Couldn't approve the guest`);
                }
            }

            // Fetch request data
            const requestData = await Service.findOne({ where: { serviceId: requestId }, transaction });
            if (!requestData) {
                throw new NotFoundException("Service", "serviceId", requestId);
            }

            // Create profile & add service/request data to profile (if not already exist) [call addUserProfile action from UserProfiles Service]
            try {
                await this._userProfilesService.addUserProfile({ userId, name: requestData.name }, transaction);

                //eslint-disable-next-line
            } catch (err: any) {
                if (err instanceof AlreadyExistsException) {
                    // Log and continue processing
                    logger.info(err.message);
                } else {
                    // Log and continue processing for other errors
                    logger.error(`Couldn't create a profile: ${err.message}`);
                    throw new Error(`Couldn't create a profile`);
                }
            }

            // Destroy guest-service record (mark record as approved) [soft delete]
            await guestRequest.update({ resolved: true }, { transaction });

            await transaction.commit(); // Commit the transaction

            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback(); // Rollback the transaction in case of error
            logger.error(`Error approving guest request: ${error.message}`);
            throw new Error(`Error approving guest request`);
        }
    }

}
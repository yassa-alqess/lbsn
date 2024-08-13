import Profile from "../../shared/models/profile";
import { IProfileResponse, IProfilesGetResponse } from "../profiles/profiles.interface";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IProfileAddPayload } from "./user-profiles.interface";
import User from "../../shared/models/user";
import sequelize from "../../config/database/connection";
import logger from "../../config/logger";

// 3rd party dependencies
import { Transaction } from "sequelize";
import ServicesService from "../services/services.service";


export default class UserProfilesService {

    private _serviceService = new ServicesService();
    public async addUserProfile(profilePayload: IProfileAddPayload, txn?: Transaction): Promise<IProfileResponse> {
        // Check if the user exists
        const user = await User.findByPk(profilePayload.userId);
        if (!user) {
            throw new NotFoundException('User', 'userId', profilePayload.userId);
        }

        const service = await this._serviceService.getServiceByName(profilePayload.name);
        if (!service) {
            throw new NotFoundException('Service', 'name', profilePayload.name);
        }

        // Check if the profile with the given name already exists
        const profile = await Profile.findOne({ where: { name: profilePayload.name } });
        if (profile) {
            throw new AlreadyExistsException('Profile', 'name', profilePayload.name);
        }

        const transaction = txn || await sequelize.transaction(); // start a new transaction 

        try {
            // Create the new profile
            const newProfile = await Profile.create({ ...profilePayload }, { transaction });

            // Associate the profile with the user
            await user.$add('profile', newProfile, { transaction });

            // Commit the transaction
            await transaction.commit();

            return {
                profileId: newProfile.profileId,
                name: newProfile.name,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback(); // Rollback the transaction in case of error
            logger.error(`Error adding profile: ${error.message}`);
            throw new Error(`Error adding profile`);
        }
    }

    public async getUserProfiles(userId: string): Promise<IProfilesGetResponse | undefined> {
        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFoundException('User', 'userId', userId);
        }

        const profiles = await user.$get('profiles');
        return {
            profiles: profiles.map(profile => ({
                profileId: profile.profileId,
                name: profile.name,
            }))
        };
    }
}
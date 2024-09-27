import Profile from "../../shared/models/profile";
import { IProfileResponse, IProfilesGetResponse } from "../profiles/profiles.interface";
import { NotFoundException } from "../../shared/exceptions";
import { IProfileAddPayload } from "./user-profiles.interface";
import User from "../../shared/models/user";
import logger from "../../config/logger";
import DatabaseManager from "../../config/database/db-manager";

// 3rd party dependencies
import { Sequelize, Transaction } from "sequelize";
import ServicesService from "../services/services.service";


export default class UserProfilesService {

    private _serviceService = new ServicesService();
    private _sequelize: Sequelize | null = null;
    constructor() {
        this._sequelize = DatabaseManager.getSQLInstance();
    }
    public async addUserProfile(profilePayload: IProfileAddPayload, txn?: Transaction): Promise<IProfileResponse> {
        const transaction = txn || await this._sequelize!.transaction(); // start a new transaction 

        // Check if the user exists
        const user = await User.findByPk(profilePayload.userId, { transaction });
        if (!user) {
            throw new NotFoundException('User', 'userId', profilePayload.userId);
        }

        const service = await this._serviceService.getServiceByName(profilePayload.name);
        if (!service) {
            throw new NotFoundException('Service', 'name', profilePayload.name);
        }

        try {
            // Create the new profile
            const newProfile = await Profile.create({ ...profilePayload }, { transaction });

            // Associate the profile with the user
            await user.$add('profile', newProfile, { transaction });

            // Commit the transaction
            if (!txn) await transaction.commit();

            const newProfileJson = newProfile.toJSON() as IProfileResponse;
            return {
                ...newProfileJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            if (!txn) await transaction.rollback(); // Rollback the transaction in case of error
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
                ...profile.toJSON() as IProfileResponse
            }))
        };
    }
}
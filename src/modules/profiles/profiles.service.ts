import { IProfileResponse, IProfileUpdatePayload } from "./profiles.interface";
import Profile from "../../shared/models/profile";
import { NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";
import ServicesService from "../services/services.service";

export default class ProfileService {
    private _servicesService = new ServicesService();
    public async updateProfile(profilePayload: IProfileUpdatePayload): Promise<IProfileResponse | undefined> {
        const { profileId } = profilePayload;

        try {
            const profile = await Profile.findByPk(profileId);
            if (!profile) {
                throw new NotFoundException('Profile', 'profileId', profileId);
            }

            const service = await this._servicesService.getServiceByName(profilePayload.name as string);
            if (!service) {
                throw new NotFoundException('Serice', 'name', service!.name);
            }
            const newProfile = await profile.update({ ...profilePayload });
            const newProfileJSON = newProfile.toJSON() as IProfileResponse;
            return {
                ...newProfileJSON,
            };
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error updating profile: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating profile: ${error.message}`);
        }
    }

    public async getProfile(profileId: string): Promise<IProfileResponse | undefined> {
        const profile = await Profile.findByPk(profileId);
        if (!profile) {
            throw new NotFoundException('Profile', 'profileId', profileId);
        }

        const profileJson = profile.toJSON() as IProfileResponse;
        return {
            ...profileJson,
        };
    }

    public async deleteProfile(profileId: string): Promise<void> {
        try {
            const profile = await Profile.findByPk(profileId);
            if (!profile) {
                throw new NotFoundException('Profile', 'profileId', profileId);
            }

            await profile.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting profile: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting profile: ${error.message}`);
        }
    }
}
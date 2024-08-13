import { IProfileResponse, IProfileUpdatePayload } from "./profiles.interface";
import Profile from "../../shared/models/profile";
import { NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";

export default class ProfileService {
    public async updateProfile(profilePayload: IProfileUpdatePayload): Promise<IProfileResponse | undefined> {
        const { profileId } = profilePayload;
        const profile = await Profile.findByPk(profileId);
        if (!profile) {
            throw new NotFoundException('Profile', 'profileId', profileId);
        }
        try {
            await profile.update({ ...profilePayload });
            return {
                profileId: profile.profileId,
                name: profile.name,
            };
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error updating profile: ${error.message}`);
            throw new Error(`Error updating profile`);
        }
    }

    public async getProfile(profileId: string): Promise<IProfileResponse | undefined> {
        const profile = await Profile.findByPk(profileId);
        if (!profile) {
            throw new NotFoundException('Profile', 'profileId', profileId);
        }
        return {
            profileId: profile.profileId,
            name: profile.name,
        };
    }
    public async deleteProfile(profileId: string): Promise<void> {
        const profile = await Profile.findByPk(profileId);
        if (!profile) {
            throw new NotFoundException('Profile', 'profileId', profileId);
        }
        try {

            await profile.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting profile: ${error.message}`);
            throw new Error(`Error deleting profile`);
        }
    }
}
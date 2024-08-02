import { IProfileAddPayload, IProfileResponse, IProfileUpdatePayload } from "./profiles.interface";
import Profile from "../../shared/models/profile";
import { ProfileAlreadyExistsError } from "../../shared/errors";

export default class ProfileService {
    public async addProfile(profilePayload: IProfileAddPayload): Promise<IProfileResponse> {
        const profile = await Profile.findOne({ where: { name: profilePayload.name } });
        if (profile) {
            throw new ProfileAlreadyExistsError('Profile already exists');
        }
        const newProfile = await Profile.create({ ...profilePayload });
        return {
            profileId: newProfile.profileId,
            name: newProfile.name,
        };
    }

    public async updateProfile(profilePayload: IProfileUpdatePayload): Promise<IProfileResponse> {
        const { profileId } = profilePayload;
        const profile = await Profile.findByPk(profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }
        await profile.update({ ...profilePayload });
        return {
            profileId: profile.profileId,
            name: profile.name,
        };
    }
    public async getProfile(profileId: string): Promise<IProfileResponse> {
        const profile = await Profile.findByPk(profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }
        return {
            profileId: profile.profileId,
            name: profile.name,
        };
    }
    public async deleteProfile(profileId: string): Promise<void> {
        const profile = await Profile.findByPk(profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }
        await profile.destroy();
    }
}
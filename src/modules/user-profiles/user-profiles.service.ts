import Profile from "../../shared/models/profile";
import UserProfile from "../../shared/models/user-profile";
import { IProfilesGetResponse } from "../profiles/profiles.interface";



export default class UserProfilesService {
    public async addUserProfile(userId: string, profileId: string): Promise<void> {
        await UserProfile.create({ userId, profileId });
    }

    public async getUserProfiles(userId: string): Promise<IProfilesGetResponse> {
        const userProfiles = await UserProfile.findAll({ where: { userId } });
        const profileIds = userProfiles.map(userProfile => userProfile.profileId);
        const profileRecords = await Profile.findAll({ where: { profileId: profileIds } });

        return { profiles: profileRecords.map(profile => ({ profileId: profile.profileId, name: profile.name })) };
    }

    public async deleteUserProfile(userId: string, profileId: string): Promise<void> {
        await UserProfile.destroy({ where: { userId, profileId } });
    }
}
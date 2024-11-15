import LeadsService from "../../modules/leads/leads.service";
import Profile from "../models/profile";
export async function SyncSheetData() {
    const leadsService = new LeadsService();
    const profiles = await Profile.findAll();

    for (const profile of profiles) {
        leadsService.syncSheetData({ profileId: profile.profileId, sheetUrl: profile.sheetUrl, sheetName: profile.sheetName });
    }
}
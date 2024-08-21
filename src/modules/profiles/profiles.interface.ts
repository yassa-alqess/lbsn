import { MarketingBudgetEnum } from "../../shared/enums";

export interface IProfileResponse {
    profileId: string;
    name: string;
    marketingBudget: MarketingBudgetEnum;
    sheetUrl: string;
    sheetName: string;
    userId: string;
}
export interface IProfileUpdatePayload {
    profileId: string;
    name?: string;
    marketingBudget?: MarketingBudgetEnum;
    sheetUrl?: string;
    sheetName?: string;
}

export interface IProfilesGetResponse {
    profiles: IProfileResponse[]
}
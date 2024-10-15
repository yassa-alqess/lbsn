import { MarketingBudgetEnum } from "../../shared/enums";

export interface IProfileResponse {
    profileId: string;
    marketingBudget: MarketingBudgetEnum;
    sheetUrl: string;
    sheetName: string;
    userId: string;
    serviceId: string;
}
export interface IProfileUpdatePayload {
    profileId: string;
    marketingBudget?: MarketingBudgetEnum;
    sheetUrl?: string;
    sheetName?: string;
    serviceId?: string;
}

export interface IProfilesGetResponse {
    profiles: IProfileResponse[]
}
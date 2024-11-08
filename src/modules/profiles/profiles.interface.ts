import { MarketingBudgetEnum } from "../../shared/enums";

export interface IProfileResponse {
    profileId: string;
    marketingBudget: MarketingBudgetEnum;
    sheetUrl: string;
    sheetName: string;
    userId: string;
    serviceId: string;
    categoryId: string;
    serviceName: string;
}
export interface IProfileUpdatePayload {
    profileId: string;
    marketingBudget?: MarketingBudgetEnum;
    sheetUrl?: string;
    sheetName?: string;
    serviceId?: string;
    categoryId?: string;
}

export interface IProfilesGetResponse {
    profiles: IProfileResponse[]
}
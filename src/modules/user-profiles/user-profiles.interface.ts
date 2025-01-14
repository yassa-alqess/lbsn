import { MarketingBudgetEnum } from "../../shared/enums";

export interface IProfileAddPayload {
    userId: string;
    marketingBudget: MarketingBudgetEnum;
    sheetUrl?: string;
    sheetName?: string;
    serviceId: string;
    categoryId: string;
    requestId: string;
}

export interface IProfileRequestPayload {
    userId: string;
    marketingBudget: MarketingBudgetEnum;
    serviceId: string;
    categoryId: string;
}
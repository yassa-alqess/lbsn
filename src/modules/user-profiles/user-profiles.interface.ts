import { MarketingBudgetEnum } from "../../shared/enums";

export interface IProfileAddPayload {
    userId: string;
    marketingBudget: MarketingBudgetEnum;
    sheetUrl: string;
    sheetName: string;
    serviceId: string;
}

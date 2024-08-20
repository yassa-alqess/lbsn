import { MarketingBudgetEnum } from "../../shared/enums";

export interface IProfileAddPayload {
    userId: string;
    name: string;
    marketingBudget: MarketingBudgetEnum;
    sheetUrl: string;
}

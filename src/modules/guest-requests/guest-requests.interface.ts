import { IsResolvedEnum, MarketingBudgetEnum } from "../../shared/enums";
export interface IgetGuestRequestsResponse {
    gestRequests: IGuestRequest[];
}

export interface IGuestRequest {
    guestRequestId: string;
    guestId: string;
    requestId: string;
    name: string;
    status: IsResolvedEnum;
    marketingBudget: MarketingBudgetEnum;
}


export interface IGuestRequestAddPayload {
    guestId: string;
    requestId: string;
    marketingBudget: MarketingBudgetEnum;
}

export interface IGuestRequestUpdatePayload {
    guestId: string;
    requestId: string;
    marketingBudget?: MarketingBudgetEnum;
}
import { IsResolvedEnum, MarketingBudgetEnum } from "../../shared/enums";
export interface IgetGuestRequestsResponse {
    gestRequests: IGuestRequest[];
}

export interface IGuestRequest {
    requestId: string;
    guestId: string;
    serviceId: string;
    serviceName?: string;
    categoryId: string;
    categoryName?: string;
    status: IsResolvedEnum;
    marketingBudget: MarketingBudgetEnum;
}


export interface IGuestRequestAddPayload {
    guestId: string;
    serviceId: string;
    categoryId: string;
    marketingBudget: MarketingBudgetEnum;
}

export interface IGuestRequestUpdatePayload {
    requestId: string;
    serviceId?: string;
    categoryId?: string;
    marketingBudget?: MarketingBudgetEnum;
    status?: IsResolvedEnum;
}
import { DealCurrencyEnum, LeadStatusEnum, SalesStageEnum } from "../../shared/enums";

export interface ISalesGetPayload {
    profileId: string;
    stage?: SalesStageEnum;
    limit?: number;
    offset?: number;
}

export interface ISaleUpdatePayload {
    saleId: string;
    status?: LeadStatusEnum;
    otherType?: string;
    stage?: SalesStageEnum;
    dealValue?: number;
    dealCurrency?: DealCurrencyEnum;
    comment?: string;
}

export interface ISaleAddPayload {
    profileId: string;
    stage: SalesStageEnum;
    dealValue: number;
    dealCurrency: DealCurrencyEnum;
    comment?: string;
}

export interface ISalesGetResponse {
    sales: ISale[];
    total: number;
}

export interface ISale {
    saleId: string;
    record: object;
    stage: SalesStageEnum;
    dealValue: number;
    dealCurrency: DealCurrencyEnum;
    comment: string;
    // profileId: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface GroupedSales {
    profileId: string;
    salesCount: number;
    sales: ISale[];
}
import { DealCurrencyEnum, LeadStatusEnum, SalesStageEnum } from "../../shared/enums";

export interface ILeadsGetPayload {
    profileId: string;
    status?: LeadStatusEnum;
    otherType?: string;
    limit?: number;
    offset?: number;
}

export interface ILeadUpdatePayload {
    leadId: string;
    status?: LeadStatusEnum;
    otherType?: string;
    stage?: SalesStageEnum;
    dealValue?: number;
    dealCurrency?: DealCurrencyEnum;
    comment?: string;
}

export interface ILeadAddPayload {
    profileId: string;
    record: object;
    status: LeadStatusEnum;
    otherType?: string;
}

export interface ILeadsGetResponse {
    leads: ILead[];
    total: number;
    pages: number;
}

export interface ILead {
    leadId: string;
    record: object;
    status: LeadStatusEnum;
    otherType?: string;
    // profileId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GroupedLeads {
    profileId: string;
    leadsCount: number;
    leads: ILead[];
}
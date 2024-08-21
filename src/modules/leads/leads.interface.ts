import { LeadStatusEnum } from "../../shared/enums";

export interface ILeadsGetPayload {
    profileId: string;
    status?: LeadStatusEnum;
    limit?: number;
    offset?: number;
}

export interface ILeadUpdatePayload {
    leadId: string;
    status?: LeadStatusEnum;
}

export interface ILeadsGetResponse {
    leads: ILead[];
    total: number;
}

export interface ILead {
    leadId: string;
    record: object;
    status: LeadStatusEnum;
    // profileId: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface GroupedLead {
    profileId: string;
    leadCount: number;
    leads: ILead[];
}
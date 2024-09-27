import { TicketStatusEnum } from "../../shared/enums";

export interface ITicketsGetPayload {
    profileId: string;
    status?: TicketStatusEnum;
}

export interface ITicketsGetResponse {
    tickets: ITicket[];

}

export interface ITicket {
    ticketId: string;
    documentUrl: string;
    profileId: string;
    title: string;
    comment: string;
    status: TicketStatusEnum;
    createdAt: Date;
    resolvedAt?: Date;
}

export interface ITicketsAddPayload {
    profileId: string;
    title: string;
    comment?: string;
    documentUrl?: string;
}

export interface ITicketsUpdatePayload {
    ticketId: string;
    title?: string;
    comment?: string;
    documentUrl?: string;
}
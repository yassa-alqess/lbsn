export interface ITicketsGetPayload {
    profileId: string;
    status: number;
}

export interface ITicketsGetResponse {
    tickets: ITicket[];

}

export interface ITicket {
    ticketId: string;
    documentUrl: string;
    // profileId: string;
    title: string;
    comment: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITicketsAddPayload {
    profileId: string;
    title: string;
    comment: string;
}

export interface ITicketResolvePayload {
    ticketId: string;
    status: number;
}
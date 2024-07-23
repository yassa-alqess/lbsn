export interface TicketsGetPayload {
    profileId: string;
    status: number;
}

export interface TicketsAddPayload {
    profileId: string;
    comment: string;
}
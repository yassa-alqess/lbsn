import { IsApprovedEnum } from "../../shared/enums";

export interface IGuestAddPayload {
    email: string;
    name: string;
    taxId?: string;
    companyName: string;
    phone: string;
    location: string;
}

export interface IGuestResponse {
    guestId: string;
    email: string;
    name: string;
    taxId?: string;
    companyName: string;
    phone: string;
    location: string;
    approved: IsApprovedEnum;
}
export interface IGuestUpdatePayload {
    guestId: string;
    email?: string;
    name?: string;
    taxId?: string;
    companyName?: string;
    phone?: string;
    location?: string;
}

export interface IGuestsGetResponse {
    guests: IGuestResponse[]
}
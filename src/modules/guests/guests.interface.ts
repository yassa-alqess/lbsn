import { IEmailOptions } from "../../config/mailer/email.interface";
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

export interface ApproveGuestResponse {
    userId: string;
    email: string;
    sendEmail: boolean;
    emailPayload?: IEmailOptions;
}
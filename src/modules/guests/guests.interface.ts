import { IEmailOptions } from "../../config/mailer/email.interface";
import { IsApprovedEnum } from "../../shared/enums";

export interface IGuestAddPayload {
    username: string;
    userEmail?: string;
    userPhone?: string;
    userAddress?: string;
    companyTaxId?: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
}

export interface IGuestResponse {
    guestId: string;
    username: string;
    userEmail: string;
    userPhone: string;
    userAddress: string;
    companytaxId: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    approved: IsApprovedEnum;
}
export interface IGuestUpdatePayload {
    guestId: string;
    username?: string;
    userEmail?: string;
    userPhone?: string;
    userAddress?: string;
    companytaxId?: string;
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;

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
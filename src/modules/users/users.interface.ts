import { IsLockedEnum, IsVerifiedEnum } from "../../shared/enums";

export interface IUserAddPayload {
    username: string;
    userEmail?: string;
    userPhone?: string;
    userAddress?: string;
    companyTaxId?: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    image?: string;
    password: string;
    isLocked?: IsLockedEnum;
    isVerified?: IsVerifiedEnum;
}

export interface IUserResponse {
    userId: string;
    username: string;
    userEmail: string;
    userPhone: string;
    userAddress: string;
    companyTaxId: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    image: string;
    isLocked: IsLockedEnum;
    isVerified: IsVerifiedEnum;
}
export interface IUserUpdatePayload {
    userId: string;
    username?: string;
    userEmail?: string;
    userPhone?: string;
    userAddress?: string;
    companyTaxId?: string;
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;
    image?: string;
    password?: string;
    isLocked?: IsLockedEnum;
    isVerified?: IsVerifiedEnum;
}

export interface IUserBulkAddResponse {
    users: IUserResponse[]
}

export interface IUsersGetPayload {
    limit: number;
    offset: number;
}

export interface IUsersGetResponse {
    users: IUserResponse[]
    total: number;
    pages: number;
}

export interface IUserUpdateInfoPayload {
    userId: string;
    username?: string;
    userEmail?: string;
    userPhone?: string;
    userAddress?: string;
    companyTaxId?: string;
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;
    image?: string;
}
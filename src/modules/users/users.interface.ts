import { IsLockedEnum, IsVerifiedEnum, RoleEnum } from "../../shared/enums";

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
    roles: RoleEnum[];

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
    roles: RoleEnum[];
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
    roles?: RoleEnum[];
}

export interface IUserBulkAddResponse {
    users: IUserResponse[]
}

export interface IUsersGetResponse {
    users: IUserResponse[]
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
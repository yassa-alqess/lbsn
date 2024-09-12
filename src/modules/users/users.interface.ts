import { IsLockedEnum, IsVerifiedEnum, RoleEnum } from "../../shared/enums";

export interface IUserAddPayload {
    email: string;
    name: string;
    taxId?: string;
    isVerified?: IsVerifiedEnum;
    companyName: string;
    phone: string;
    location: string;
    image?: string;
    password: string;
    isLocked?: IsLockedEnum;
    roles: RoleEnum[];

}

export interface IUserResponse {
    userId: string;
    email: string;
    name: string;
    taxId: string;
    isVerified?: IsVerifiedEnum;
    companyName: string;
    phone: string;
    location: string;
    image: string;
    isLocked?: IsLockedEnum;
    roles: RoleEnum[];
}
export interface IUserUpdatePayload {
    userId: string;
    email?: string;
    name?: string;
    taxId?: string;
    isVerified?: IsVerifiedEnum;
    companyName?: string;
    phone?: string;
    location?: string;
    image?: string;
    password?: string;
    isLocked?: IsLockedEnum;
    roles?: RoleEnum[];
}

export interface IUserBulkAddResponse {
    users: IUserResponse[]
}

export interface IUsersGetResponse {
    users: IUserResponse[]
}
export interface IUserAddPayload {
    email: string;
    displayName: string;
    taxId?: string;
    role: number;
    isVerified?: number;
    companyName: string;
    phone: string;
    location: string;
    image?: string;
    password?: string;
    isLocked?: number;

}

export interface IUserResponse {
    userId: string;
    email: string;
    displayName: string;
    taxId: string;
    role: number;
    isVerified: number;
    companyName: string;
    phone: string;
    location: string;
    image: string;
    password: string;
    isLocked: number;
}
export interface IUserUpdatePayload {
    userId: string;
    email?: string;
    displayName?: string;
    taxId?: string;
    role: number;
    isVerified?: number;
    companyName?: string;
    phone?: string;
    location?: string;
    image?: string;
    password?: string;
    isLocked?: number;
}

export interface IUserBulkAddResponse {
    users: IUserResponse[]
}

export interface IUsersGetResponse {
    users: IUserResponse[]
}
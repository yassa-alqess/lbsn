export interface IUserAddPayload {
    email: string;
    name: string;
    taxId?: string;
    role: number;
    isVerified?: boolean;
    companyName: string;
    phone: string;
    location: string;
    image?: string;
    password: string;
    isLocked?: boolean;

}

export interface IUserResponse {
    userId: string;
    email: string;
    name: string;
    taxId: string;
    role: number;
    isVerified: boolean;
    companyName: string;
    phone: string;
    location: string;
    image: string;
    password: string;
    isLocked: boolean;
}
export interface IUserUpdatePayload {
    userId: string;
    email?: string;
    name?: string;
    taxId?: string;
    role: number;
    isVerified?: boolean;
    companyName?: string;
    phone?: string;
    location?: string;
    image?: string;
    password?: string;
    isLocked?: boolean;
}

export interface IUserBulkAddResponse {
    users: IUserResponse[]
}

export interface IUsersGetResponse {
    users: IUserResponse[]
}
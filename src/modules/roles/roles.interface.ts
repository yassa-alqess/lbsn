import { RoleEnum } from "../../shared/enums";

export interface IRoleAddPayload {
    name: RoleEnum;
}

export interface IRoleResponse {
    roleId: string;
    name: RoleEnum;
}

export interface IRoleUpdatePayload {
    roleId: string;
    name: RoleEnum;
}

export interface IRolesGetResponse {
    roles: IRoleResponse[]
}
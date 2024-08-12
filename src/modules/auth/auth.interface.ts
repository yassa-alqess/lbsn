import { RoleEnum } from "../../shared/enums";

export interface IAuthPayload {
    id: string;
    roles: RoleEnum[];
}
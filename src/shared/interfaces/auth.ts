// import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
export interface IAuthPayload {
    id: string;
    role: number;
}

export interface AuthenticatedRequest extends Request {
    user?: IAuthPayload;
}
import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
export interface UserPayload extends JwtPayload {
    id: string;
    role: number;
}

export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}
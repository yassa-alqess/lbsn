import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../interfaces/auth";
import { StatusCodes } from "http-status-codes";

export const roleGuard = (requiredRole: number) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }

        if (req.user.role !== requiredRole) {
            return res.sendStatus(StatusCodes.UNAUTHORIZED);
        }

        next();
    };
}
import { IAuthPayload } from "../../modules/auth/auth.interface";
import { RoleEnum } from "../enums";
import { ACCESS_TOKEN_SECRET } from "../constants";

//3rd party dependinces
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from 'jsonwebtoken';

export function requireAnyOfThoseRoles(allowedRoles: RoleEnum[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as IAuthPayload;
            const hasRole = decoded.roles.some((role) => allowedRoles.includes(role));
            if (hasRole) {
                return next();
            }
            return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' });
        } catch (err) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid token' });
        }
    };
}
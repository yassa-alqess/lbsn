import { IAuthPayload } from "../../modules/auth/auth.interface";
import { RoleEnum } from "../enums";
import { ACCESS_TOKEN_SECRET } from "../constants";
import { TokenMissingException, UNAuthorizedException, InvalidTokenException } from "../exceptions";

//3rd party dependinces
import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export function requireAnyOfThoseRoles(allowedRoles: RoleEnum[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            next(new TokenMissingException());
        }

        try {
            const decoded = jwt.verify(token as string, ACCESS_TOKEN_SECRET) as IAuthPayload;
            const hasRole = decoded.roles.some((role) => allowedRoles.includes(role));
            if (hasRole) {
                return next();
            }
            next(new UNAuthorizedException());
        } catch (err) {
            next(new InvalidTokenException('Access token'));
        }
    };
}
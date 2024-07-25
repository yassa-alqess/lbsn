

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../constants';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest, UserPayload } from '../interfaces/auth';



export const accessTokenGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(StatusCodes.BAD_REQUEST);
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(StatusCodes.UNAUTHORIZED);
        }
        req.user = user as UserPayload;
        next();
    });
}
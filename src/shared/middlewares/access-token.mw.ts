import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../constants';
import { StatusCodes } from 'http-status-codes';
import { IAuthPayload } from '../interfaces/auth';


export default async function accessTokenGuard(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(StatusCodes.BAD_REQUEST);
    }

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as string) as IAuthPayload;
        req.user = decoded;  // Attach the decoded token payload to the request object
        next();
    } catch (err) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
}
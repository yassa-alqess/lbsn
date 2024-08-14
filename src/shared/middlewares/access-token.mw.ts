//file dependinces
import { ACCESS_TOKEN_SECRET } from '../constants';
import { IAuthPayload } from '../../modules/auth/auth.interface';
import { AuthTokenMissingException, InvalidAuthTokenException } from '../exceptions';
import { initializeRedisClient } from '../../config/cache';
import logger from '../../config/logger';

//3rd party dependinces
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';



export async function accessTokenGuard(req: Request, res: Response, next: NextFunction) {
    const _redisClient = await initializeRedisClient();
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AuthTokenMissingException());
    }

    const isValid = await _redisClient.get(token);
    if (!isValid) {
        logger.info(`Token expired or invalid`);
        return res.status(401).json('Token invalid or expired');
    }

    try {
        const decoded = jwt.verify(token as string, ACCESS_TOKEN_SECRET as string) as IAuthPayload
        req.user = decoded;  // Attach the decoded token payload to the request object
        next();
    } catch (err) {
        next(new InvalidAuthTokenException());
    }
}
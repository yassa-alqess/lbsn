//file dependinces
import { ACCESS_TOKEN_SECRET } from '../constants';
import { IAuthPayload } from '../../modules/auth/auth.interface';
import { TokenMissingException, InvalidTokenException, ExpiredException } from '../exceptions';
import { initializeRedisClient } from '../../config/cache';
import logger from '../../config/logger';

//3rd party dependinces
import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';



export async function accessTokenGuard(req: Request, res: Response, next: NextFunction) {
    const _redisClient = await initializeRedisClient();
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new TokenMissingException('Access token'));
    }

    try {
        const decoded = jwt.verify(token as string, ACCESS_TOKEN_SECRET as string) as IAuthPayload

        const isValid = await _redisClient.get(`access-token:${decoded.id}:${token}`);
        if (!isValid) { //token valid and not expired but it's not cached, so it's logged out
            logger.info(`user logged out`);
            return next(new InvalidTokenException('Access token')); //don't reveal the reason
        }

        req.user = decoded;
        return next();
        //eslint-disable-next-line
    } catch (err: any) {
        logger.error(`Invalid access token: ${err.message}`);
        if (err instanceof TokenExpiredError) {
            return next(new ExpiredException('Access token'));
        }
        return next(new InvalidTokenException('Access token'));
    }
}
import jwt from 'jsonwebtoken';
import { UserPayload } from '../interfaces/auth';
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } from '../constants';
import { promisify } from 'util';


export const generateAccessTokenAsync = promisify((user: UserPayload) => {
    jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
});
export const generateRefreshTokenAsync = promisify((user: UserPayload) => {
    return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
});

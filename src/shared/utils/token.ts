import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } from '../constants';
import { IAuthPayload } from '../../modules/auth/auth.interface';


export const generateAccessToken = (user: IAuthPayload) => {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};
export const generateRefreshToken = (user: IAuthPayload) => {
    return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

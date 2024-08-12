// file dependencies
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, AUTH_PATH, REFRESH_TOKEN_SECRET } from '../../shared/constants';
import { IAuthPayload } from './auth.interface';
import { Controller } from '../../shared/interfaces/controller.interface';
import RefreshToken from '../../shared/models/refresh-token';
import { validate } from '../../shared/middlewares';
import AuthService from './auth.service';
import logger from '../../config/logger';
import { LoginSchema, LogoutSchema, RefreshTokenSchema } from './auth.dto';
import { InternalServerException, NotFoundException, WrongCredentialsException } from '../../shared/exceptions';

// 3rd party dependencies
import jwt from 'jsonwebtoken';
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class AuthController implements Controller {
    path = AUTH_PATH;
    router = express.Router();
    private _authService = new AuthService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.post(`${this.path}/login`, validate(LoginSchema), this.login);
        this.router.post(`${this.path}/logout`, validate(LogoutSchema), this.logout);
        this.router.post(`${this.path}/refresh-token`, validate(RefreshTokenSchema), this.refreshToken); //used to refresh the access token

        /**
         * @TODO 
         * !to be Implemented
         *  this.router.post(`${this.path}/forget-password`, this.forgetPassword); //send email with token
            this.router.get(`${this.path}/forget-password`, this.forgetPassword); //validate the token and redirect to FE
            this.router.post(`${this.path}/reset-password`, this.resetPassword); //FE send the new password 

            this.router.post(`${this.path}/change-password`,accessTokenGuard, this.changePassword); //FE send old and new password

            this.router.post(`${this.path}/verify-email`, this.verifyEmail); //send email with token to user email
            this.router.get(`${this.path}/verify-email`, this.verifyToken); //verify email and redirect the user to FE

            this.router.post(`${this.path}/verify-otp`, this.verifyOtp); //used in 2FA
         */
    }
    public login = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        try {
            const tokens = await this._authService.login(email, password);
            res.status(StatusCodes.OK).json({
                accessToken: tokens[0],
                refreshToken: tokens[1],
                type: 'Bearer',
            }).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at login action ${error.message}`);
            if (error instanceof NotFoundException || error instanceof WrongCredentialsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public logout = async (req: Request, res: Response, next: NextFunction) => {
        const { accessToken, refreshToken } = req.body;

        jwt.verify(accessToken, ACCESS_TOKEN_SECRET as string, (err: jwt.VerifyErrors | null) => {
            if (err)
                return res.status(StatusCodes.UNAUTHORIZED).json('Invalid token').end();
        });

        try {
            await this._authService.logout(accessToken, refreshToken);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at logout action ${error.message}`);
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.body;
        try {
            const refreshToken = await RefreshToken.findOne({
                where: {
                    value: token,
                },
            });

            if (!refreshToken)
                return res.status(StatusCodes.BAD_REQUEST).json('Invalid token').end();

            if (refreshToken.expiresAt < new Date())
                return res.status(StatusCodes.UNAUTHORIZED).json('Token expired').end();

            jwt.verify(token, REFRESH_TOKEN_SECRET as string, (err: jwt.VerifyErrors | null, user: string | jwt.JwtPayload | undefined) => {
                if (err)
                    return res.status(StatusCodes.UNAUTHORIZED).json('Invalid token').end();


                const userPayload = user as IAuthPayload;

                const accessToken = jwt.sign(
                    { id: userPayload.id, roles: userPayload.roles },
                    ACCESS_TOKEN_SECRET as string,
                    { expiresIn: ACCESS_TOKEN_EXPIRY }
                );
                res.json({ accessToken }).end();
            });
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at refreshToken action ${error.message}`);
            next(new InternalServerException(error.message));
        }

    }
}
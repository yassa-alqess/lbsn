// file dependencies
import { ACCESS_TOKEN_SECRET, AUTH_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces/controller.interface';
import { validate } from '../../shared/middlewares';
import AuthService from './auth.service';
import logger from '../../config/logger';
import { ForgetPasswordSchema, LoginSchema, LogoutSchema, RefreshTokenSchema, ResetPasswordSchema, VerifyEmailSchema, VerifyOtpSchema } from './auth.dto';
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
        this.router.post(`${this.path}/refresh-token`, validate(RefreshTokenSchema), this.refreshToken);

        this.router.post(`${this.path}/verify-email`, validate(VerifyEmailSchema), this.verifyEmail);
        this.router.post(`${this.path}/verify-otp`, validate(VerifyOtpSchema), this.verifyOtp);
        this.router.post(`${this.path}/forget-password`, validate(ForgetPasswordSchema), this.forgetPassword);
        this.router.post(`${this.path}/reset-password`, validate(ResetPasswordSchema), this.resetPassword);
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
        const { refreshToken } = req.body;
        try {
            const tokens = await this._authService.refreshToken(refreshToken);
            res.status(StatusCodes.OK).json({
                accessToken: tokens[0],
                refreshToken: tokens[1],
                type: 'Bearer',
            }).end();
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at refreshToken action ${error.message}`);
            next(new InternalServerException(`${error.message}`));
        }
    }

    public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        try {
            await this._authService.verifyEmail(email);
            res.status(StatusCodes.OK).end();
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at verifyEmail action ${error.message}`);
            next(new InternalServerException(`${error.message}`));
        }
    }

    public forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        try {
            await this._authService.forgetPassword(email);
            res.status(StatusCodes.OK).end();
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at forgetPassword action ${error.message}`);
            next(new InternalServerException(`${error.message}`));
        }
    }

    public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { password, otp } = req.body;
        try {
            await this._authService.resetPassword(password, otp);
            res.status(StatusCodes.OK).end();
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at resetPassword action ${error.message}`);
            next(new InternalServerException(`${error.message}`));
        }
    }

    public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        const { otp } = req.body;
        try {
            await this._authService.verifyOtp(otp);
            res.status(StatusCodes.OK).end();
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at verifyOtp action ${error.message}`);
            next(new InternalServerException(`${error.message}`));
        }
    }
}
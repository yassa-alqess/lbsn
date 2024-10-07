// file dependencies
import { AUTH_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces/controller.interface';
import { accessTokenGuard, validate } from '../../shared/middlewares';
import AuthService from './auth.service';
import logger from '../../config/logger';
import { ForgetPasswordSchema, LoginSchema, LogoutSchema, RefreshTokenSchema, ResetPasswordSchema, VerifyEmailSchema } from './auth.dto';
import { AlreadyUsedException, AlreadyVerifiedException, ExpiredException, InternalServerException, InvalidTokenException, NotFoundException, ParamRequiredException, WrongCredentialsException } from '../../shared/exceptions';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IAuthPayload } from './auth.interface';

export default class AuthController implements Controller {
    path = `/${AUTH_PATH}`;
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
        this.router.get(`${this.path}/verify-email`, this.verifyEmailToken);

        this.router.post(`${this.path}/forget-password`, validate(ForgetPasswordSchema), this.forgetPassword);
        this.router.post(`${this.path}/change-password`, accessTokenGuard, this.changePassword);
        this.router.get(`${this.path}/reset-password`, this.verifyResetToken);
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

        try {
            await this._authService.logout(accessToken, refreshToken);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at logout action ${error.message}`);
            if (error instanceof NotFoundException || error instanceof InvalidTokenException || error instanceof ExpiredException) {
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
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error at verifyEmail action: ${error.message}`);
            if (error instanceof NotFoundException || error instanceof AlreadyVerifiedException) {
                return next(error);
            }
            next(new InternalServerException(`${error.message}`));
        }
    }

    public verifyEmailToken = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.query;
        try {
            await this._authService.verifyEmailToken(token as string);
            res.status(StatusCodes.OK).json({}).end();
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error at verifyEmailToken action: ${error.message}`);

            if (error instanceof InvalidTokenException || error instanceof ExpiredException || error instanceof NotFoundException || error instanceof AlreadyUsedException) {
                return next(error);
            }
            next(new InternalServerException(`${error.message}`));
        }
    }

    public forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        try {
            await this._authService.forgetPassword(email);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in forgetPassword action: ${error.message}`);

            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }

    }

    public changePassword = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.user as IAuthPayload;

        try {
            await this._authService.changePassword(id);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in changePassword action: ${error.message}`);

            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.query;
        if (!token) {
            return next(new ParamRequiredException('token'));
        }
        try {
            await this._authService.verifyResetToken(token as string);
            res.status(StatusCodes.OK).json({}).end();
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in verifyResetToken action: ${error.message}`);

            if (error instanceof InvalidTokenException || error instanceof ExpiredException || error instanceof AlreadyUsedException) {
                return next(error);
            }
            next(new InternalServerException(`${error.message}`));
        }
    }

    public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.query;
        const { newPassword } = req.body;
        if (!token) {
            return next(new ParamRequiredException('token'));
        }
        try {
            await this._authService.resetPassword(token as string, newPassword);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in resetPassword action: ${error.message}`);

            if (error instanceof InvalidTokenException || error instanceof ExpiredException || error instanceof AlreadyUsedException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

}
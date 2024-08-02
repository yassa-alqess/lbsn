
// file dependencies
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, AUTH_PATH, REFRESH_TOKEN_SECRET } from '../../shared/constants';
import { IAuthPayload } from './auth.interface';
import Controller from '../../shared/interfaces/controller.interface';
import RefreshToken from '../../shared/models/refresh-token';
import { accessTokenGuard } from '../../shared/middlewares';
import AuthService from './auth.service';

// 3rd party dependencies
import jwt from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class AuthController implements Controller {
    path = AUTH_PATH;
    router = express.Router();
    private _authService = new AuthService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.post(`${this.path}/login`, this.login);
        this.router.post(`${this.path}/logout`, accessTokenGuard, this.logout); // require authentication
        this.router.post(`${this.path}/forget-password`, this.forgetPassword);
        this.router.post(`${this.path}/reset-password`, this.resetPassword);
        this.router.post(`${this.path}/verify-email`, this.verifyEmail);
        this.router.post(`${this.path}/verify-otp`, this.verifyOtp);
        this.router.post(`${this.path}/refresh-token`, this.refreshToken);

    }
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const tokens = await this._authService.login(email, password);
            res.status(StatusCodes.OK).json(tokens);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async logout(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body;
            await this._authService.logout(token);
            res.status(StatusCodes.OK).json({ message: 'Logout successfully' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async forgetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this._authService.forgetPassword(email);
            res.status(StatusCodes.OK).json({ message: 'Email sent' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { otp } = req.body;
            await this._authService.verifyOtp(otp);
            res.status(StatusCodes.OK).json({ message: 'matched' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            await this._authService.resetPassword(email, password);
            res.status(StatusCodes.OK).json({ message: 'Password reset successfully' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this._authService.verifyEmail(email);
            res.status(StatusCodes.OK).json({ message: 'Email sent' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async refreshToken(req: Request, res: Response) {
        try {
            const { token } = req.body;

            if (!token)
                return res.sendStatus(StatusCodes.BAD_REQUEST);


            const refreshToken = await RefreshToken.findOne({
                where: {
                    value: token,
                },
            });

            if (!refreshToken)
                return res.sendStatus(StatusCodes.UNAUTHORIZED);


            if (refreshToken.expiresAt < new Date())
                return res.sendStatus(StatusCodes.UNAUTHORIZED);


            jwt.verify(token, REFRESH_TOKEN_SECRET as string, (err: jwt.VerifyErrors | null, user: string | jwt.JwtPayload | undefined) => {
                if (err)
                    return res.sendStatus(StatusCodes.UNAUTHORIZED);


                const userPayload = user as IAuthPayload;

                const accessToken = jwt.sign(
                    { id: userPayload.id, roles: userPayload.roles },
                    ACCESS_TOKEN_SECRET as string,
                    { expiresIn: ACCESS_TOKEN_EXPIRY }
                );
                res.json({ accessToken });
            });
        } catch (error) {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        }

    }
}
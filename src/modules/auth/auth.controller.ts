import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AuthService from './auth.service';
export default class AuthController {
    constructor(private readonly authService: AuthService) { }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const tokens = await this.authService.login(email, password);
            res.status(StatusCodes.OK).json(tokens);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async logout(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body;
            await this.authService.logout(token);
            res.status(StatusCodes.OK).json({ message: 'Logout successfully' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async forgetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.authService.forgetPassword(email);
            res.status(StatusCodes.OK).json({ message: 'Email sent' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { otp } = req.body;
            await this.authService.verifyOtp(otp);
            res.status(StatusCodes.OK).json({ message: 'matched' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            await this.authService.resetPassword(email, password);
            res.status(StatusCodes.OK).json({ message: 'Password reset successfully' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.authService.verifyEmail(email);
            res.status(StatusCodes.OK).json({ message: 'Email sent' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

}
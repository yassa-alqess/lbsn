import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
export default class AuthController {
    constructor(private readonly authService: AuthService) { }
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const token = await this.authService.login(email, password);
            res.status(StatusCodes.OK).json(token);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async logout(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.authService.logout(email);
            res.status(StatusCodes.OK).json({ message: 'Logout successfully' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    // public async register(req: Request, res: Response): Promise<void> {
    //     try {
    //         const { email, password } = req.body;
    //         const user = await this.authService.register(email, password);
    //         res.status(StatusCodes.OK).json(user);
    //     } catch (error) {
    //         res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    //     }
    // }

    public async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.authService.forgotPassword(email);
            res.status(StatusCodes.OK).json({ message: 'Email sent' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, token } = req.body;
            await this.authService.resetPassword(email, password, token);
            res.status(StatusCodes.OK).json({ message: 'Password reset successfully' });
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email, token } = req.body;
            await this.authService.verifyEmail(email, token);
            res.status(StatusCodes.OK).json({ message: 'Email verified successfully' });
        //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { email, refreshToken } = req.body;
            const token = await this.authService.refreshToken(email, refreshToken);
            res.status(StatusCodes.OK).json(token);
        //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

}
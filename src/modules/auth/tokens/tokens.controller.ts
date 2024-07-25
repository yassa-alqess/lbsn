
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TokenService from './tokens.service'
export default class TokensController {
    constructor(private readonly tokenService: TokenService) {
    }
    public issueToken = async (req: Request, res: Response) => {
        try {

            const { token } = req.body;

            if (!token) {
                return res.sendStatus(StatusCodes.BAD_REQUEST);
            }

            const accessToken = await this.tokenService.issueToken(token);
            res.status(StatusCodes.OK).json(accessToken);
            //eslint-disable-next-line
        } catch (err: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
        }
    }
};
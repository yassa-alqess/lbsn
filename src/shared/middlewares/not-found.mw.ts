import { StatusCodes } from "http-status-codes";
import { Request, Response } from 'express';
export function notFoundMiddleware(_: Request, res: Response) {
    res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Resource not found' });
}
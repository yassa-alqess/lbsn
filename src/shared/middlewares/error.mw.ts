import { NextFunction, Request, Response } from 'express';
import logger from '../../config/logger';
import HttpException from '../exceptions/http.exception';
import { StatusCodes } from "http-status-codes";

export function errorMiddleware(error: HttpException, _: Request, res: Response, next: NextFunction) {
  logger.debug(`catched error: ${error.message}`);
  if (res.headersSent) {
    return next(error)
  }
  const statusCode = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Something went wrong';
  res.status(statusCode).json({ success: false, message });
}
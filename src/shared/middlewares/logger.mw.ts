import logger from '../../config/logger';

//3rd party dependinces
import { NextFunction, Request, Response } from 'express';

function loggerMiddleware(request: Request, response: Response, next: NextFunction) {
  logger.info(`${request.method} ${request.path}`);
  next();
}

export default loggerMiddleware;

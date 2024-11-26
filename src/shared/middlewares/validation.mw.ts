//3rd party dependinces
import { Request, Response, NextFunction, RequestHandler } from 'express';
import HttpException from '../exceptions/http.exception';
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import logger from '../../config/logger';
import { formatRoles } from '../utils';

export function validate(schema: Joi.ObjectSchema, target: 'body' | 'query' | 'params' = 'body'): RequestHandler {
  return (req: Request, _: Response, next: NextFunction) => {
    const { roles } = req.body;
    if (roles) req.body.roles = formatRoles(roles);
    
    const dataToValidate = req[target]; // Dynamically select the part of the request
    const { error } = schema.validate(dataToValidate, { abortEarly: false });

    if (error) {
      logger.error(`Error validating request: ${error.message}`);
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new HttpException(StatusCodes.BAD_REQUEST, message));
    }

    next();
  };
}
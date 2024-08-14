import logger from '../../config/logger';
import { Request, Response, NextFunction } from 'express';
import HttpException from '../exceptions/http.exception';

export function responseFormatter(req: Request, res: Response, next: NextFunction) {
    const oldJson = res.json.bind(res);

    //eslint-disable-next-line
    res.json = function (data: any) {
        logger.debug('formating response', data);

        if (data instanceof Error || data instanceof HttpException || data.error || data.success === false) {
            const response = {
                success: false,
                message: data.message || data.error || 'something went wrong',
                data: {},
            };
            return oldJson(response);
        }

        const response = {
            success: res.statusCode >= 200 && res.statusCode < 300,
            message: res.statusMessage || '',
            data,
        };
        return oldJson(response);
    };
    next();
}
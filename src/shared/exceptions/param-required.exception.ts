import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class ParamRequiredException extends HttpException {
    constructor(type: string, param: string) {
        super(StatusCodes.NOT_FOUND, `${param} is required for ${type}`);
    }
}

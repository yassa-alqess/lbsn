import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class ParamRequiredException extends HttpException {
    constructor(param: string) {
        super(StatusCodes.NOT_FOUND, `${param} is required`);
    }
}

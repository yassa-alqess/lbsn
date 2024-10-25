import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class ExpiredException extends HttpException {
    constructor(type: string) {
        super(StatusCodes.FORBIDDEN, `${type} expired`);
    }
}

import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class InvalidIdException extends HttpException {
    constructor(type: string, value: string) {
        super(StatusCodes.NOT_FOUND, `invalid id for ${type}: ${value}`);
    }
}

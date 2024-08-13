import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class InvalidEnumValueException extends HttpException {
    constructor(type: string) {
        super(StatusCodes.BAD_REQUEST, `invalid enum value for ${type}`);
    }
}

import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class UserLoggedOutException extends HttpException {
    constructor() {
        super(StatusCodes.BAD_REQUEST, 'User is logged out');
    }
}


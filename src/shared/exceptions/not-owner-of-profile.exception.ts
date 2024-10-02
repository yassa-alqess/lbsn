import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class NotOwnerOfProfileException extends HttpException {
    constructor() {
        super(StatusCodes.UNAUTHORIZED, "You're not the owner of this profile");
    }
}
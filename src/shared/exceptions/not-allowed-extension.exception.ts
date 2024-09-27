import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class NotAllowedExtensionException extends HttpException {
    constructor() {
        super(StatusCodes.BAD_REQUEST, `File extension is not allowed`);
    }
}


import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class LargeFileException extends HttpException {
    constructor() {
        super(StatusCodes.BAD_REQUEST, 'File is too large');
    }
}


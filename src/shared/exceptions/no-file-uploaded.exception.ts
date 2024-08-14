import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class NoFileUploadedException extends HttpException {
    constructor() {
        super(StatusCodes.BAD_REQUEST, 'No file uploaded');
    }
}

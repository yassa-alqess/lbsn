import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class AuthTokenMissingException extends HttpException {
  constructor() {
    super(StatusCodes.BAD_REQUEST, 'Authentication token missing');
  }
}

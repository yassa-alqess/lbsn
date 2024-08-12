import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class InvalidAuthTokenException extends HttpException {
  constructor() {
    super(StatusCodes.BAD_REQUEST, 'invalid authentication token');
  }
}

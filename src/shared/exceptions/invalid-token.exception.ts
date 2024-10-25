import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class InvalidTokenException extends HttpException {
  constructor(type = 'token') {
    super(StatusCodes.FORBIDDEN, `${type} is invalid`);
  }
}

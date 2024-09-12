import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class InvalidTokenException extends HttpException {
  constructor(type = 'token') {
    super(StatusCodes.BAD_REQUEST, `${type} is invalid`);
  }
}

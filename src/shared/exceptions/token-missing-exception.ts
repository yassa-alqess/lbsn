import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class TokenMissingException extends HttpException {
  constructor(type = "token") {
    super(StatusCodes.UNAUTHORIZED, `${type} is missing`);
  }
}

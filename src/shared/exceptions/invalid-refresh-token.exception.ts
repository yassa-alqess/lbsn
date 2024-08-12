import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class InvalidRefreshTokenException extends HttpException {
  constructor() {
    super(StatusCodes.BAD_REQUEST, 'invalid refresh token');
  }
}

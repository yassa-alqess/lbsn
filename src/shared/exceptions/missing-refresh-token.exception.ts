import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class MissingRefreshTokenException extends HttpException {
  constructor() {
    super(StatusCodes.BAD_REQUEST, 'missing refresh token');
  }
}

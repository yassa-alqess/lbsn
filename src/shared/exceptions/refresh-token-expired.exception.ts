import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class RefreshTokenExpiredException extends HttpException {
  constructor() {
    super(StatusCodes.BAD_REQUEST, 'refresh token expired');
  }
}

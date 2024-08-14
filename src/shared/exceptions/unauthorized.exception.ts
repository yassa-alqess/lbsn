import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class UNAuthorizedException extends HttpException {
  constructor() {
    super(StatusCodes.UNAUTHORIZED, "You're not authorized");
  }
}

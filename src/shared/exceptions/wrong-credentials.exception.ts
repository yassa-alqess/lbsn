import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class WrongCredentialsException extends HttpException {
  constructor() {
    super(StatusCodes.BAD_REQUEST, 'Wrong credentials provided');
  }
}

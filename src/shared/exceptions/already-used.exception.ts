import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class AlreadyUsedException extends HttpException {
  constructor(type: string = "token") {
    super(StatusCodes.CONFLICT, `${type} already used`);
  }
}


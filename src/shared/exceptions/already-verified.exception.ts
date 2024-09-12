import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class AlreadyVerifiedException extends HttpException {
  constructor(type: string = "email") {
    super(StatusCodes.CONFLICT, `${type} already verified`);
  }
}


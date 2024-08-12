import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class InternalServerException extends HttpException {
  constructor(message: string) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message);
  }
}

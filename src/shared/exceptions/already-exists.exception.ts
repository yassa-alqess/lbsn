import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class AlreadyExistsException extends HttpException {
  constructor(type: string, name: string, value: string) {
    super(StatusCodes.CONFLICT, `${type} with ${name}: ${value} already exists`);
  }
}


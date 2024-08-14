import HttpException from './http.exception';
import { StatusCodes } from 'http-status-codes';

export class NotFoundException extends HttpException {
  constructor(type: string, name: string, value: string) {
    super(StatusCodes.NOT_FOUND, `${type} with ${name}: ${value} not found`);
  }
}

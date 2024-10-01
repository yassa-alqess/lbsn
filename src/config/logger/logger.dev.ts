import { createLogger, transports, format, Logger } from 'winston';
const { combine, timestamp, printf, json, colorize } = format;
import { ENV } from '../../shared/constants';

let devLogger: Logger | null = null;
if (ENV === 'dev') {
  devLogger = createLogger({
    transports: [
      new transports.File({ filename: `.logs/dev/dev.log` }),
      new transports.Console({ format: format.combine(colorize(), format.simple()) }),
    ],
    level: process.env.LOG_LEVEL || 'debug',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSSZZ' }),
      json(),
      printf(({ timestamp, level, message, service = '' }) => {
        return `[${timestamp}] ${service} [${level}]: ${message}`;
      }),
    ),
  });
}

export { devLogger };
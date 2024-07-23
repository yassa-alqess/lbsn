import { createLogger, transports, format } from 'winston';
const { combine, timestamp, printf, json, colorize } = format;
export const devLogger = createLogger({
  transports: [
    new transports.File({ filename: `.logs/dev/dev.log` }),
    new transports.Console({ format: format.combine(colorize(), format.simple()) }),
  ],
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    timestamp({ format: 'HH:mm:ss' }),
    json(),
    printf(({ timestamp, level, message, service = '' }) => {
      return `[${timestamp}] ${service} [${level}]: ${message}`;
    }),
  ),
});

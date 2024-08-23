import { createLogger, transports, format } from 'winston';
const { combine, timestamp, printf, json, colorize } = format;
console.log(process.env.LOG_LEVEL);
export const prodLogger = createLogger({
  transports: [
    new transports.File({
      filename: '.logs/prod/prod.log',
    }),
    new transports.Console({ format: format.combine(colorize(), format.simple()) }),
  ],
  level: process.env.LOG_LEVEL || 'info', // info and above
  format: combine(
    timestamp({ format: 'HH:mm:ss' }),
    json(),
    printf(({ timestamp, level, message, service = '' }) => {
      return `[${timestamp}] ${service} [${level}]: ${message}`;
    }),
  ),
});

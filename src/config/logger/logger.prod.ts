import { createLogger, transports, format } from 'winston';
const { combine, timestamp, printf } = format;
export const prodLogger = createLogger({
  transports: [
    new transports.File({
      filename: '.logs/prod/prod.log',
    }),
  ],
  level: process.env.LOG_LEVEL || 'info', // info and above
  format: combine(
    timestamp(), // server time
    printf(({ timestamp, level, message, service = '' }) => {
      return `[${timestamp}] ${service} [${level}]: ${message}`;
    }),
  ),
});

import { transports } from 'winston';
import 'winston-daily-rotate-file';
import logger from './index';

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: '.logs/dev/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

dailyRotateFileTransport.on('archive', (zipFilename) => {
  logger.info(`logs archived into ${zipFilename} on ${new Date().toISOString()}`);
});

export default dailyRotateFileTransport;
import { devLogger } from './logger.dev';
import { prodLogger } from './logger.prod';
import { testLogger } from './logger.test-d';
import { ENV } from '../../shared/constants';
import { Logger } from 'winston';
const logger = ENV === 'dev' ? devLogger : ENV === 'test' ? testLogger : prodLogger;
export default logger as Logger;


// timezone printed is UTC
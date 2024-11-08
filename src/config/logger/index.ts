import { devLogger } from './logger.dev';
import { prodLogger } from './logger.prod';
import { testLogger } from './logger.test-d';
import { ENV } from '../../shared/constants';
import { Logger } from 'winston';

let logger: Logger | null = null;

switch (ENV) {
    case 'dev':
        logger = devLogger;
        break;
    case 'test':
        logger = testLogger;
        break;
    default:
        logger = prodLogger;
}

export default logger as Logger;


// timezone printed is UTC
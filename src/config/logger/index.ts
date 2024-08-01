import { devLogger } from './logger.dev';
import { prodLogger } from './logger.prod';
import { testLogger } from './logger.test-d';
export default process.env.NODE_ENV === 'prod'
    ? prodLogger
    : process.env.NODE_ENV === 'test'
        ? testLogger
        : devLogger;
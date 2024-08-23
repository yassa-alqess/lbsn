import { devLogger } from './logger.dev';
import { prodLogger } from './logger.prod';
import { testLogger } from './logger.test-d';
import { ENV } from '../../shared/constants';
export default logger = ENV === 'development' ? devLogger : ENV === 'testing' ? testLogger : prodLogger;

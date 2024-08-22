import { devLogger } from './logger.dev';
import { prodLogger } from './logger.prod';
import { testLogger } from './logger.test-d';
import { ENV } from '../../shared/constants';
console.log("ENV", ENV);
export default ENV === 'development' ? devLogger : ENV === 'testing' ? testLogger : prodLogger;
import { devLogger } from './logger.dev';
import { prodLogger } from './logger.prod';
import { testLogger } from './logger.test-d';
export default process.env.NODE_ENV === 'production'
  ? prodLogger
  : process.env.NODE_ENV === 'test'
    ? testLogger
    : devLogger;

// let logr;
// import(`./logger.${'dev'}`).then((loggerModule) => {
//   logr = loggerModule;
//   console.debug('⚡logging service is up ');
//   console.log('logr', logr.devLogge);
// });
// export default logr;

/**

import { Logger } from 'winston';
let logger: Logger | null = null;

(async () => {
    try {
        const loggerModule = await import(`./logger.${process.env.NODE_ENV || 'dev'}`);
        logger = loggerModule.default;
        console.debug('⚡logging service is up ');
    } catch (error) {
        console.error('Error initializing logger:', error);
    }
})();



export default logger;
export const getLogger = (): Logger | null => logger;
*/

/**
 *
 *
 * ?dist-path: server/.logs/<env>.log
 *
 *
 * @TODO
 * set a test logger with warn level,
 * configure testing env & database for testing stage,
 * configure docker properly with testing env,
 * configure docker-compose properly with testing env,
 * load balancer is not for testing stage, consider that
 * consider any relpication or code duplication in compose scripts.
 *
 * dotenv config procedure is passed to startup, so things might be wrong in testing.
 */

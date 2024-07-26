// 3rd-party dependencies
import express, { Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'http';

// src imports & config
import { ENV, PORT } from './config/env'; //will also trigger dotenv config procedure
import { syncDatabase, closeConnection } from './config/database/connection';
import logger from './config/logger';
import restRouter from './modules/routes';

// app container & middlewares
const APP = express();
APP.use(express.json());
APP.use(express.urlencoded({ extended: true })); // no need for body-parser
APP.use(cors(
  {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
  },
));
APP.use(helmet());
APP.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
APP.set('trust proxy', 1); // trust nginx


// map the app routes
APP.use('/api/v0.1/', restRouter);

// startup script
let server: Server | null = null;

(async () => {
  try {
    await syncDatabase(); // sync db & catch errors
    APP.get('/', (_, res: Response) => {
      res.sendStatus(200);
    });
    server = APP.listen(PORT, () => {
      logger.info(`⚡️[server]: Server is running at http://localhost:${PORT} in ${ENV} mode`);
    });

  } catch (error) {
    logger.error('Unable to connect,', error);
    process.exit(1);
  }
})();

// graceful shutdown
process.on('SIGINT', async () => {
  server!.close(() => {
    logger.info('Server closed gracefully');
    closeConnection().then(() => {
      process.exit(0);
    });
  });
});

export default APP; // exports for testing


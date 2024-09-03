// 3rd-party dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer, Server as SecureServer } from 'https';
import fs from 'fs';
import { Server } from 'http';

// src imports & config
import './config/env'
import { ENV, PORT } from './shared/constants'; //will also trigger dotenv config procedure
import logger from './config/logger';
import { initDatabases, closeConnections } from './config/database/db-factory'; // close db connection
import { errorMiddleware, notFoundMiddleware, responseFormatter, loggerMiddleware } from './shared/middlewares';
import { initializeRedisClient } from './config/cache'; // initialize redis client
import { initWebSocket, initSecureWebSocket } from './config/ws';
import { userRolesMigration } from './shared/migrations/seed-data';
import { ExtendedWebSocketServer } from './shared/interfaces';
import './shared/workers' // schedule cron jobs


// app container & middlewares
const APP = express();



// startup script
// maybe later we can use a factory pattern to initialize the server
// mayber later we will support self-signed certificates for local development
let server: Server | SecureServer | null = null;
let WSS: ExtendedWebSocketServer | null = null;

if (ENV === 'development') {
  server = APP.listen(PORT, () => {
    logger.info(`⚡️[server]: Server is running at http://localhost:${PORT} in ${ENV} mode`);
  });
  WSS = initWebSocket(server as Server); // initialize websocket server
}
else {
  // Load SSL certificates
  const sslOptions = {
    key: fs.readFileSync('/usr/app/certs/privkey1.pem'),
    cert: fs.readFileSync('/usr/app/certs/fullchain1.pem'),
  };
  server = createServer(sslOptions, APP);
  server.listen(PORT, () => {
    logger.info(`⚡️[server]: Server is running at https://localhost:${PORT} in ${ENV} mode`);
  });
  WSS = initSecureWebSocket(server as SecureServer); // initialize websocket server
}

(async () => {
  try {

    APP.use(express.json())
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

    // middlewares & routes
    APP.use(loggerMiddleware)
    APP.use(responseFormatter)
    const { default: restRouter } = await import('./modules/routes');
    APP.use('/api/v0.1/', restRouter);
    APP.use(errorMiddleware);
    APP.use(notFoundMiddleware);

    await initDatabases(); // initialize db connections
    await initializeRedisClient(); // initialize redis client
    await userRolesMigration(); // migration to seed roles and admin user

  } catch (error) {
    logger.error('Unable to connect,', error);
    process.exit(1);
  }
})();

// graceful shutdown
process.on('SIGINT', async () => {
  server!.close(() => {
    logger.info('Server closed gracefully');
    closeConnections().then(() => {
      process.exit(0);
    });
  });
});

export const APP_SERVER = APP; // exports for testing
export const SERVER = server; // exports for ws
export const WSS_SERVER = WSS; // exports for ws
// file dependinces
import './config/env'
import TicketController from "./modules/tickets/tickets.controller";
import TaskController from "./modules/tasks/tasks.controller";
import UserController from "./modules/users/users.controller";
import TaskSubmissionController from "./modules/task-submission/task-submission.controller";
import logger from "./config/logger";
import { closeConnection } from "./config/database/connection";
import App from './app';

// 3rd-party dependencies
import { Server } from "http";

const app = new App([

  new UserController(),
  new TicketController(),
  new TaskController(),
  new TaskSubmissionController()

]);
// startup script
let httpServer: Server | null = null;

(async () => {
  try {

    httpServer = app.listen();

  } catch (error) {
    logger.error('Unable to connect,', error);
    process.exit(1);
  }
})();

// graceful shutdown
process.on('SIGINT', async () => {
  httpServer!.close(() => {
    logger.info('httpServer closed gracefully');
    closeConnection().then(() => {
      process.exit(0);
    });
  });
});




// file dependinces
import './config/env'
import logger from "./config/logger";
import { closeConnection } from "./config/database/connection";
import App from './app';

import TicketController from "./modules/tickets/tickets.controller";
import TaskController from "./modules/tasks/tasks.controller";
import UserController from "./modules/users/users.controller";
import TaskSubmissionController from "./modules/task-submission/task-submission.controller";
import UserProfilesController from './modules/user-profiles/user-profiles.controller';
import ProfileController from './modules/profiles/profiles.controller';
import GuestController from './modules/guests/guests.controller';
import ServiceController from './modules/services/services.controller';
import TimeSlotsController from './modules/time-slots/time-slots.controller';
import AppointmentController from './modules/appointments/appointments.controller';

// 3rd-party dependencies
import { Server } from "http";


const app = new App([

  new UserController(),
  new TicketController(),
  new TaskController(),
  new TaskSubmissionController(),
  new ProfileController(),
  new GuestController(),
  new ServiceController(),
  new UserProfilesController(),
  new ServiceController(),
  new TimeSlotsController(),
  new AppointmentController(),

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




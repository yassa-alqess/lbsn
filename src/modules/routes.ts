
import { Router } from 'express';
import AppointmentController from './appointments/appointments.controller';
import ServiceController from './services/services.controller';
import UserController from './users/users.controller';
import TaskSubmissionController from './task-submission/task-submission.controller';
import TimeSlotsController from './time-slots/time-slots.controller';
import GuestController from './guests/guests.controller';
import TicketController from './tickets/tickets.controller';
import TaskController from './tasks/tasks.controller';
import GuestRequestsController from './guest-requests/guest-requests.controller';
import ProfileController from './profiles/profiles.controller';
import RolesController from './roles/roles.controller';
import AuthController from './auth/auth.controller';
import UserProfilesController from './user-profiles/user-profiles.controller';
import LeadsController from './leads/leads.controller';

const restRouter = Router();
restRouter.use('/', new AppointmentController().router);
restRouter.use('/', new ServiceController().router);
restRouter.use('/', new UserController().router);
restRouter.use('/', new TimeSlotsController().router);
restRouter.use('/', new GuestController().router);
restRouter.use('/', new GuestRequestsController().router);
restRouter.use('/', new TaskController().router);
restRouter.use('/', new TicketController().router);
restRouter.use('/', new TaskSubmissionController().router);
restRouter.use('/', new ProfileController().router);
restRouter.use('/', new UserProfilesController().router);
restRouter.use('/', new RolesController().router);
restRouter.use('/', new AuthController().router);
restRouter.use('/', new LeadsController().router);

export default restRouter;
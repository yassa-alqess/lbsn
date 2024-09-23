
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
import WarmController from './warm-leads/warm-leads.controller';
const restRouter = Router();
for (const controller of [
    AppointmentController,
    ServiceController,
    UserController,
    TaskSubmissionController,
    TimeSlotsController,
    GuestController,
    TicketController,
    TaskController,
    GuestRequestsController,
    ProfileController,
    RolesController,
    AuthController,
    UserProfilesController,
    LeadsController,
    WarmController,
]) {
    const instance = new controller();
    restRouter.use('/', instance.router);
}

export default restRouter;
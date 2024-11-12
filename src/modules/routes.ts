
import { Router } from 'express';
import AppointmentController from './appointments/appointments.controller';
import ServicesController from './services/services.controller';
import CategoriesController from './categories/categories.controller';
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
import SalesController from './sales/sales.controller';
import WarmController from './warm-leads/warm-leads.controller';
import ContactUsController from './contact-us/contact-us.controller';
import OverviewController from './overview/overview.controller';
import FilesController from './files/files.controller';
import JobsController from './careers/jobs/jobs.controller';

const restRouter = Router();
for (const controller of [
    AppointmentController,
    ServicesController,
    CategoriesController,
    UserController,
    TaskSubmissionController,
    TimeSlotsController,
    GuestController,
    TicketController,
    TaskController,
    GuestRequestsController,
    RolesController,
    AuthController,
    UserProfilesController,
    ProfileController,
    LeadsController,
    SalesController,
    WarmController,
    ContactUsController,
    OverviewController,
    FilesController,
    JobsController,
]) {
    const instance = new controller();
    restRouter.use('/', instance.router);
}

export default restRouter;
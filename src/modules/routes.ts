import { Router } from "express";
import taskRouter from "./tasks/tasks.api";
import taskSubmissionRouter from "./task-submission/task-submission.api";
import ticketRouter from "./tickets/tickets.api";
import accessTokenGuard from "../shared/middlewares/access-token.mw";

const restRouter = Router();

restRouter.use("/tasks", accessTokenGuard, taskRouter);
restRouter.use("/task-submission", taskSubmissionRouter);
restRouter.use("tickets", ticketRouter);
export default restRouter;

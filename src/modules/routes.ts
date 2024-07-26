import { Router } from "express";
import taskRouter from "./tasks/tasks.api";
import taskSubmissionRouter from "./task-submission/task-submission.api";

const restRouter = Router();

restRouter.use("/tasks", taskRouter);
restRouter.use("/task-submission", taskSubmissionRouter);
export default restRouter;

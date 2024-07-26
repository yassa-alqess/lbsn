import { Router } from "express";
import taskRouter from "./tasks/tasks.api";

const restRouter = Router();

restRouter.use("/tasks", taskRouter);

export default restRouter;
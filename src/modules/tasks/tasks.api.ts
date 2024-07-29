import express from "express";
import TaskController from "./tasks.controller";
import TaskService from "./tasks.service";
// import accessTokenGuard from "@/shared/middlewares/access-token.mw";
// import roleGuard from "@/shared/middlewares/role.mw";
const taskRouter = express.Router();
const taskController = new TaskController(new TaskService());

taskRouter.all('/*',); // Protect all routes with role 1
taskRouter.get("/", taskController.getTasks); //get-tasks
taskRouter.post("/", taskController.addTask); //add-task

export default taskRouter;
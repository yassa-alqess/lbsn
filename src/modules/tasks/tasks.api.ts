import express from "express";
import TaskController from "./tasks.controller";
import TaskService from "./tasks.service";
const taskRouter = express.Router();
const taskController = new TaskController(new TaskService());

taskRouter.post("/get-tasks", taskController.getTasks);
taskRouter.post("/add-task", taskController.addTask);

export default taskRouter;
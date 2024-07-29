import express from "express";
import TaskController from "./tasks.controller";
import TaskService from "./tasks.service";
const taskRouter = express.Router();
const taskController = new TaskController(new TaskService());

taskRouter.get("/", taskController.getTasks); //get-tasks
taskRouter.post("/", taskController.addTask); //add-task

export default taskRouter;
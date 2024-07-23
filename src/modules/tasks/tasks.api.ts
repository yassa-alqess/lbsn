import express from "express";
import TaskController from "./tasks.controller";
import TaskService from "./tasks.service";
const taskRouter = express.Router();
const taskController = new TaskController(new TaskService());

// taskRouter.post("/submitTaskResponse", upload("tasks")!.single("file"), taskController.submitTaskResponse);
taskRouter.post("/getTasks", taskController.getTasks);
taskRouter.post("/addTask", taskController.addTask);
// taskRouter.post("/resolveTask", taskController.resolveTask);

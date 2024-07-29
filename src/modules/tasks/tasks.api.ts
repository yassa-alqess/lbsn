import express from "express";
import TaskController from "./tasks.controller";
import TaskService from "./tasks.service";
const taskRouter = express.Router();
const taskController = new TaskController(new TaskService());

// taskRouter.post("/submitTaskResponse", upload("tasks")!.single("file"), taskController.submitTaskResponse);
taskRouter.post("/get-tasks", taskController.getTasks);
taskRouter.post("/add-task", taskController.addTask);
// taskRouter.post("/resolveTask", taskController.resolveTask);
export default taskRouter;
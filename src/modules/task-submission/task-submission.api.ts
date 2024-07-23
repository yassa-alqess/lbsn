import upload from "../../config/storage/multer.config";
import express from "express";
import TaskSubmissonController from "./task-submission.controller";
import TaskSubmissonService from "./task-submission.service";
const taskRouter = express.Router();
const taskController = new TaskSubmissonController(new TaskSubmissonService());

taskRouter.post("/addTaskSubmisson", upload("taskSubmissions")!.single("file"), taskController.addTaskSubmissonResponse);
taskRouter.post("/updateTaskSubmisson", upload("taskSubmissions")!.single("file"), taskController.updateTaskSubmissonResponse);

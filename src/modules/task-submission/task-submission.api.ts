import upload from "../../config/storage/multer.config";
import express from "express";
import TaskSubmissonController from "./task-submission.controller";
import TaskSubmissonService from "./task-submission.service";
const taskSubmissionRouter = express.Router();
const taskController = new TaskSubmissonController(new TaskSubmissonService());

taskSubmissionRouter.post("/addTaskSubmisson", upload("taskSubmissions")!.single("file"), taskController.addTaskSubmisson);
taskSubmissionRouter.post("/updateTaskSubmisson", upload("taskSubmissions")!.single("file"), taskController.updateTaskSubmisson);
taskSubmissionRouter.post("/getTaskSubmission", taskController.getTaskSubmission);

export default taskSubmissionRouter;
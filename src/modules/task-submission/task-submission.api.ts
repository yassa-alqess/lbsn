import upload from "../../config/storage/multer.config";
import express from "express";
import TaskSubmissonController from "./task-submission.controller";
import TaskSubmissonService from "./task-submission.service";
const taskSubmissionRouter = express.Router();
const taskController = new TaskSubmissonController(new TaskSubmissonService());

taskSubmissionRouter.post("/add-task-submisson", upload("taskSubmissions")!.single("file"), taskController.addTaskSubmisson);
taskSubmissionRouter.post("/update-task-submisson", upload("taskSubmissions")!.single("file"), taskController.updateTaskSubmisson);
taskSubmissionRouter.post("/get-task-submission", taskController.getTaskSubmission);

export default taskSubmissionRouter;
import upload from "../../config/storage/multer.config";
import express from "express";
import TaskSubmissonController from "./task-submission.controller";
import TaskSubmissonService from "./task-submission.service";
const taskSubmissionRouter = express.Router();
const taskController = new TaskSubmissonController(new TaskSubmissonService());

taskSubmissionRouter.get("/:id", taskController.getTaskSubmissionByTaskId); //get-task-submission
taskSubmissionRouter.patch("/:id", upload("taskSubmissions")!.single("file"), taskController.updateTaskSubmisson); //update-task-submisson
taskSubmissionRouter.post("/", upload("taskSubmissions")!.single("file"), taskController.addTaskSubmisson); //add-task-submisson
export default taskSubmissionRouter;
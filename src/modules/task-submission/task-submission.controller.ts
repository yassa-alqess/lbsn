
import { TasksAddPayload, TasksGetPayload } from '../../shared/interfaces/task';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TaskService from './task-submission.service';
export default class TaskController {
    constructor(private readonly taskService: TaskService) { }

    public addTask = async (req: Request, res: Response) => {
        try {
            const taskPayload: TasksAddPayload = req.body;
            const path = req.file ? req.file.filename : '';
            const task = await this.taskService.addTask(taskPayload, path); // path may be empty string
            res.status(StatusCodes.CREATED).json(task);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

    public getTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await this.taskService.getTasks();
            res.status(200).json(tasks);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    public assignTask = async (req: Request, res: Response) => {
        try {
            const taskPayload: TasksGetPayload = req.body;
            const tasks = await this.taskService.assignTask(taskPayload);
            res.status(200).json(tasks);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

}
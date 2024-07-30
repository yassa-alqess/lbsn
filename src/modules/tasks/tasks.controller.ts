
import { ITasksAddPayload, ITasksGetPayload } from '../../shared/interfaces/task';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TaskService from './tasks.service';
export default class TaskController {
    constructor(private readonly taskService: TaskService) { }

    public addTask = async (req: Request, res: Response) => {
        try {
            const taskPayload: ITasksAddPayload = req.body;
            await this.taskService.addTask(taskPayload);
            res.status(StatusCodes.CREATED)
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

    public getTasks = async (req: Request, res: Response) => {
        try {
            const { id, status } = req.params;
            const payload: ITasksGetPayload = {
                profileId: id,
                status: status ? parseInt(status) : 0
            }
            const tasks = await this.taskService.getTasks(payload);
            res.status(StatusCodes.OK).json(tasks);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

}

// file dependinces
import { ITasksAddPayload, ITasksGetPayload } from './tasks.interface';
import { TASKS_PATH } from '../../shared/constants';
import Controller from '../../shared/interfaces/controller.interface';
import TaskService from './tasks.service';
import { accessTokenGuard, requireAnyOfThoseRoles } from '../../shared/middlewares';
import { RoleEnum } from '../../shared/enums';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TaskController implements Controller {
    path = TASKS_PATH;
    router = express.Router();
    private _taskService = new TaskService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.use(accessTokenGuard);
        this.router.get(`${this.path}/:id/:status?`, this.getTasks);

        this.router.use(requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]));
        this.router.post(this.path, this.addTask);

        // there is no update or delete tasks yet
        // this.router.patch(`${this.path}/:id`, this.updateTask);
        // this.router.delete(`${this.path}/:id`, this.deleteTask);

    }

    public addTask = async (req: Request, res: Response) => {
        try {
            const taskPayload: ITasksAddPayload = req.body;
            await this._taskService.addTask(taskPayload);
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
            const tasks = await this._taskService.getTasks(payload);
            res.status(StatusCodes.OK).json(tasks);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

}
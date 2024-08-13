
// file dependinces
import { ITasksAddPayload, ITasksGetPayload, ITaskUpdatePayload } from './tasks.interface';
import { DUPLICATE_ERR, INVALID_UUID, TASKS_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces/controller.interface';
import TaskService from './tasks.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { RoleEnum, TaskStatusEnum } from '../../shared/enums';
import { AlreadyExistsException, InternalServerException, InvalidEnumValueException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import logger from '../../config/logger';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TaskController implements Controller {
    path = TASKS_PATH;
    router = express.Router();
    private _taskService = new TaskService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`${this.path}`, accessTokenGuard, this.getTasks);
        this.router.get(`${this.path}/:taskId`, accessTokenGuard, this.getTask);

        this.router.all(`${this.path}*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))
        this.router.post(this.path, validate(CreateTaskDto), this.addTask);
        this.router.patch(`${this.path}/:taskId`, validate(UpdateTaskDto), this.updateTask);
        this.router.delete(`${this.path}/:taskId`, this.deleteTask);
    }

    public addTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const taskPayload: ITasksAddPayload = req.body;
            await this._taskService.addTask(taskPayload);
            res.status(StatusCodes.CREATED).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at addTask action', error);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Task', 'title', req.body.title));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public getTasks = async (req: Request, res: Response, next: NextFunction) => {
        const { profileId } = req.query;
        if (!profileId) {
            return next(new ParamRequiredException('Task', 'profileId'));
        }
        const { status } = req.query;
        if (status && !Object.values(TaskStatusEnum).includes(status as TaskStatusEnum)) {
            return next(new InvalidEnumValueException('TaskStatus'));
        }
        try {
            const payload: ITasksGetPayload = {
                profileId: profileId as string,
                status: status as TaskStatusEnum
            };
            const tasks = await this._taskService.getTasks(payload);
            res.status(StatusCodes.OK).json(tasks).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at getTasks action', error);
            next(new InternalServerException(error.message));
        }
    };

    public getTask = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) return next(new ParamRequiredException('Task', 'taskId'));
        try {
            const task = await this._taskService.getTask(taskId);
            res.status(StatusCodes.OK).json(task).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetTask action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('taskId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateTask = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) return next(new ParamRequiredException('Task', 'taskId'));
        try {
            const taskUpdatePayload: ITaskUpdatePayload = {
                ...req.body,
                taskId
            }
            const task = await this._taskService.updateTask(taskUpdatePayload);
            res.status(StatusCodes.OK).json(task).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateTask action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('taskId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Task', 'title', req.body.time.toString()));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteTask = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) return next(new ParamRequiredException('Task', 'taskId'));
        try {
            await this._taskService.deleteTask(taskId);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('taskId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
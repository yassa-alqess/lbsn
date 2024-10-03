
// file dependinces
import { ITasksAddPayload, ITasksGetPayload, ITaskUpdatePayload } from './tasks.interface';
import { DUPLICATE_ERR, INVALID_UUID, TASKS_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces/controller.interface';
import TaskService from './tasks.service';
import { accessTokenGuard, isOwnerOfProfileGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
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
        this.router.all(`${this.path}*`, accessTokenGuard); // protect all routes
        this.router.get(`${this.path}`, isOwnerOfProfileGuard, this.getTasks);
        this.router.get(`${this.path}/:taskId`, isOwnerOfProfileGuard, this.getTask);

        // admin routes
        this.router.post(this.path, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), validate(CreateTaskDto), this.addTask);
        this.router.patch(`${this.path}/:taskId`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), validate(UpdateTaskDto), this.updateTask);
        this.router.delete(`${this.path}/:taskId`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.deleteTask);
    }

    public addTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const taskPayload: ITasksAddPayload = {
                ...req.body,
            }
            const task = await this._taskService.addTask(taskPayload);
            res.status(StatusCodes.CREATED).json(task).end();

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
        try {
            const { profileId } = req.query;
            if (!profileId) {
                throw new ParamRequiredException('Task', 'profileId');
            }
            const { status } = req.query;
            if (status && !Object.values(TaskStatusEnum).includes(status as TaskStatusEnum)) {
                throw new InvalidEnumValueException('TaskStatus');
            }
            const payload: ITasksGetPayload = {
                profileId: profileId as string,
                status: status as TaskStatusEnum
            };
            const tasks = await this._taskService.getTasks(payload);
            res.status(StatusCodes.OK).json(tasks).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at getTasks action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('profileId'));
            }
            if (error instanceof InvalidEnumValueException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public getTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
            if (!taskId) throw new ParamRequiredException('Task', 'taskId');
            const task = await this._taskService.getTask(taskId);
            res.status(StatusCodes.OK).json(task).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetTask action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('taskId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
            if (!taskId) throw new ParamRequiredException('Task', 'taskId');

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
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
            if (!taskId) throw new ParamRequiredException('Task', 'taskId');
            await this._taskService.deleteTask(taskId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('taskId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}

// file dependinces
import { ITasksAddPayload, ITasksGetAllPayload, ITasksGetPayload, ITaskUpdatePayload } from './tasks.interface';
import { DUPLICATE_ERR, INVALID_UUID, PROFILES_PATH, TASKS_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces/controller.interface';
import TaskService from './tasks.service';
import { accessTokenGuard, isOwnerOfProfileGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { RoleEnum, TaskStatusEnum } from '../../shared/enums';
import { AlreadyExistsException, InternalServerException, InvalidEnumValueException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import logger from '../../config/logger';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import upload from '../../config/storage/multer.config';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TaskController implements Controller {
    path = TASKS_PATH;
    profilesPath = `/${PROFILES_PATH}`;
    router = express.Router();
    private _taskService = new TaskService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.profilesPath}/:profileId/${this.path}*`, accessTokenGuard, isOwnerOfProfileGuard); // protect all routes
        this.router.get(`${this.profilesPath}/:profileId/${this.path}`, this.getTasks);
        this.router.get(`${this.profilesPath}/:profileId/${this.path}/:taskId`, this.getTask);

        // admin routes
        this.router.post(`/${this.path}*`, accessTokenGuard);
        this.router.post(`/${this.path}`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), upload(`${this.path}`)!.single("file"), validate(CreateTaskDto), this.addTask);
        this.router.patch(`/${this.path}/:taskId`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), upload(`${this.path}`)!.single("file"), validate(UpdateTaskDto), this.updateTask);
        this.router.delete(`/${this.path}/:taskId`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.deleteTask);

        this.router.get(`/${this.path}/all`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.getAllTasks);
    }

    public addTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const path = req.file ? req.file.filename : '';
            const taskPayload: ITasksAddPayload = {
                ...req.body,
                documentUrl: path
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
            const { profileId } = req.params;
            if (!profileId) {
                throw new ParamRequiredException('profileId');
            }
            const { status, limit = 10, page = 1 } = req.query;
            if (status && !Object.values(TaskStatusEnum).includes(status as TaskStatusEnum)) {
                throw new InvalidEnumValueException('TaskStatus');
            }
            const payload: ITasksGetPayload = {
                profileId: profileId as string,
                status: status as TaskStatusEnum,
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
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
            if (!taskId) throw new ParamRequiredException('taskId');
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
            if (!taskId) throw new ParamRequiredException('taskId');

            const path = req.file ? req.file.filename : '';
            const taskUpdatePayload: ITaskUpdatePayload = {
                ...req.body,
                taskId,
                documentUrl: path
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
            if (!taskId) throw new ParamRequiredException('taskId');
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

    public getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit = 10, page = 1 } = req.query;

            const payload: ITasksGetAllPayload = {
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
            }
            const tasks = await this._taskService.getAllTasks(payload);
            res.status(StatusCodes.OK).json(tasks).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getAllTasks action ${error}`);
            next(new InternalServerException(error.message));
        }
    }
}
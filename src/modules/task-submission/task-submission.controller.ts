

// file dependinces
import { ITaskSubmissionAddPayload, ItaskSubmissionGetByTaskIdPayload, ITaskSubmission, ITaskSubmissionUpdatePayload } from './task-submission.interface';
import { INVALID_UUID, PROFILES_PATH, TASKS_PATH } from '../../shared/constants';
import { accessTokenGuard, isOwnerOfProfileGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import TaskSubmissionService from './task-submission.service';
import upload from '../../config/storage/multer.config';
import { Controller } from '../../shared/interfaces';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import { CreateTaskSubmissionDto, UpdateTaskSubmissionDto } from './task-submission.dto';
import { RoleEnum } from '../../shared/enums';
import logger from '../../config/logger';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TaskSubmissionController implements Controller {
    path = TASKS_PATH;
    profilesPath = `/${PROFILES_PATH}`;
    router = express.Router();
    private _taskSubmissionService = new TaskSubmissionService();

    constructor() {
        this._initializeRoutes();
    }

    //careful with tasks & task-submissions routes as they use the same path
    //that's why i'm specifying required middlewares for each endpoint
    //except auth middleware which is required for all routes and for all app users (user & admin)
    private _initializeRoutes() {
        this.router.patch(`/${this.path}/:taskId/submission/approve`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.approveTaskSubmission);

        // user routes
        this.router.all(`${this.profilesPath}/:profileId/${this.path}*`, accessTokenGuard, isOwnerOfProfileGuard); // protect all routes
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/:taskId/submission`, upload(`${this.path}/submissions`)!.single("file"),
            validate(CreateTaskSubmissionDto), this.addTaskSubmission);
        this.router.patch(`${this.profilesPath}/:profileId/${this.path}/:taskId/submission/`, upload(`${this.path}/submissions`)!.single("file"),
            validate(UpdateTaskSubmissionDto), this.updateTaskSubmission);
        this.router.get(`${this.profilesPath}/:profileId/${this.path}/:taskId/submission/`, this.getTaskSubmissionByTaskId);
        this.router.delete(`${this.profilesPath}/:profileId/${this.path}/:taskId/submission`, this.deleteTaskSubmission);
    }
    public addTaskSubmission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
            if (!taskId) {
                throw new ParamRequiredException('taskId');
            }
            const path = req.file ? req.file.filename : '';
            const taskSubmissionAddPayload: ITaskSubmissionAddPayload = {
                ...req.body,
                taskId,
                documentUrl: path
            }
            const taskSubmission = await this._taskSubmissionService.addTaskSubmission(taskSubmissionAddPayload); // path may be empty string
            res.status(StatusCodes.CREATED).json(taskSubmission).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at addTaskSubmission action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('taskId'));
            }
            if (error instanceof AlreadyExistsException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));

        }
    };

    public updateTaskSubmission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
            if (!taskId) {
                throw new ParamRequiredException('taskId');
            }

            const path = req.file ? req.file.filename : '';
            const taskSubmissionUpdatePayload: ITaskSubmissionUpdatePayload = {
                ...req.body,
                taskId,
                documentUrl: path
            }
            const taskSubmission = await this._taskSubmissionService.updateTaskSubmission(taskSubmissionUpdatePayload); // path may be empty string
            res.status(StatusCodes.CREATED).json(taskSubmission).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at updateTaskSubmission action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('taskId'));
            }
            if (error instanceof AlreadyExistsException || error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public getTaskSubmissionByTaskId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { taskId } = req.params;
            if (!taskId) {
                throw new ParamRequiredException('taskId');
            }
            const taskSubmissionGetByIdPayload: ItaskSubmissionGetByTaskIdPayload = {
                taskId,
            }
            const taskSubmissionGetByIdResponse: ITaskSubmission = await this._taskSubmissionService.getTaskSubmissionByTaskId(taskSubmissionGetByIdPayload) as ITaskSubmission;

            res.status(StatusCodes.OK).json(taskSubmissionGetByIdResponse);
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`error at GetTaskSubmissionByTaskId action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                next(new InvalidIdException('taskId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteTaskSubmission = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) return next(new ParamRequiredException('taskId'));
        try {
            await this._taskSubmissionService.deleteTaskSubmission(taskId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at DeleteTaskSubmission action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('taskId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public approveTaskSubmission = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) return next(new ParamRequiredException('taskId'));
        try {
            await this._taskSubmissionService.approveTaskSubmission(taskId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at ApproveTaskSubmission action ${error}`);
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


// file dependinces
import { ITaskSubmissionAddPayload, ItaskSubmissionGetByTaskIdPayload, ItaskSubmissionGetByTaskIdResponse, ITaskSubmissionUpdatePayload } from './task-submission.interface';
import { DUPLICATE_ERR, INVALID_UUID, TASKS_PATH } from '../../shared/constants';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import TaskSubmissionService from './task-submission.service';
import upload from '../../config/storage/multer.config';
import { Controller } from '../../shared/interfaces';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import { CreateTaskSubmissionDto, UpdateTaskSubmissionDto } from './task-submission.dto';
import { RoleEnum } from '../../shared/enums';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TaskSubmissionController implements Controller {
    path = TASKS_PATH;
    router = express.Router();
    private _taskSubmissionService = new TaskSubmissionService();

    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.path}/*`, accessTokenGuard);
        this.router.post(`${this.path}/:taskId/submission`, upload(this.path)!.single("file"),
            validate(CreateTaskSubmissionDto), this.addTaskSubmission);
        this.router.patch(`${this.path}/:taskId/submission/`, upload(this.path)!.single("file"),
            validate(UpdateTaskSubmissionDto), this.updateTaskSubmission);
        this.router.get(`${this.path}/:taskId/submission/`, this.getTaskSubmissionByTaskId);
        this.router.delete(`${this.path}/:taskId/submission`, this.deleteTaskSubmission);

        this.router.post(`${this.path}/:taskId/submission/approve`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.approveTaskSubmission);
    }
    public addTaskSubmission = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) {
            return next(new ParamRequiredException('Task', 'taskId'));
        }

        let taskSubmission;
        try {
            const path = req.file ? req.file.filename : '';
            const taskSubmissionAddPayload: ITaskSubmissionAddPayload = {
                ...req.body,
                taskId,
                documentUrl: path
            }
            taskSubmission = await this._taskSubmissionService.addTaskSubmission(taskSubmissionAddPayload); // path may be empty string
            res.status(StatusCodes.CREATED).json(taskSubmission).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('Task', taskId));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Task Submission', 'taskISubmissionId', taskSubmission!.taskSubmissionId));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));

        }
    };

    public updateTaskSubmission = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) {
            return next(new ParamRequiredException('Task', 'taskId'));
        }

        let taskSubmission;
        try {
            const path = req.file ? req.file.filename : '';
            const taskSubmissionUpdatePayload: ITaskSubmissionUpdatePayload = {
                ...req.body,
                taskId,
                documentUrl: path
            }
            taskSubmission = await this._taskSubmissionService.updateTaskSubmission(taskSubmissionUpdatePayload); // path may be empty string
            res.status(StatusCodes.CREATED).json(taskSubmission).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid taskId" });
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Task Submission', 'taskISubmissionId', taskSubmission!.taskSubmissionId));
            }
            if (error instanceof AlreadyExistsException || error instanceof NotFoundException) {
                return next(error);
            }

            next(new InternalServerException(error.message));
        }
    };

    public getTaskSubmissionByTaskId = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) {
            return next(new ParamRequiredException('Task', 'taskId'));
        }
        try {
            const taskSubmissionGetByIdPayload: ItaskSubmissionGetByTaskIdPayload = {
                taskId,
            }
            const taskSubmissionGetByIdResponse: ItaskSubmissionGetByTaskIdResponse = await this._taskSubmissionService.getTaskSubmissionByTaskId(taskSubmissionGetByIdPayload) as ItaskSubmissionGetByTaskIdResponse;

            res.status(StatusCodes.OK).json(taskSubmissionGetByIdResponse);
        } //eslint-disable-next-line
        catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                next(new InvalidIdException('Task', taskId));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteTaskSubmission = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) return next(new ParamRequiredException('Task', 'taskId'));
        try {
            await this._taskSubmissionService.deleteTaskSubmission(taskId);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('Task', taskId));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public approveTaskSubmission = async (req: Request, res: Response, next: NextFunction) => {
        const { taskId } = req.params;
        if (!taskId) return next(new ParamRequiredException('Task', 'taskId'));
        try {
            await this._taskSubmissionService.approveTaskSubmission(taskId);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('Task', taskId));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
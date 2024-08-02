

// file dependinces
import { ITaskSubmissionAddPayload, ItaskSubmissionGetByIdPayload, ItaskSubmissionGetByIdResponse, ITaskSubmissionUpdatePayload } from './task-submission.interface';
import { TASKS_PATH } from '../../shared/constants';
import { accessTokenGuard } from '../../shared/middlewares';
import TaskSubmissionService from './task-submission.service';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TaskSubmissionController {

    path = TASKS_PATH;
    router = express.Router();
    private _taskSubmissionService = new TaskSubmissionService();

    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.use(accessTokenGuard);
        this.router.post(`${this.path}/:taskId/submission`, this.addTaskSubmisson);
        this.router.patch(`${this.path}/:taskId/submission/:taskSubmissionId`, this.updateTaskSubmisson);
        this.router.get(`${this.path}/:taskId/submission`, this.getTaskSubmissionByTaskId);
    }
    public addTaskSubmisson = async (req: Request, res: Response) => {
        try {
            const taskSubmissionAddPayload: ITaskSubmissionAddPayload = {
                ...req.body,
                taskId: req.params.taskId
            }
            const path = req.file ? req.file.filename : '';
            const task = await this._taskSubmissionService.addTaskSubmisson(taskSubmissionAddPayload, path); // path may be empty string
            res.status(StatusCodes.CREATED).json(task);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };


    public updateTaskSubmisson = async (req: Request, res: Response) => {
        try {
            const { taskId, taskSubmissionId } = req.params;
            const taskSubmissionUpdatePayload: ITaskSubmissionUpdatePayload = {
                ...req.body,
                taskId,
                taskSubmissionId
            }
            const path = req.file ? req.file.filename : '';
            const task = await this._taskSubmissionService.updateTaskSubmisson(taskSubmissionUpdatePayload, path); // path may be empty string
            res.status(StatusCodes.CREATED).json(task);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

    public getTaskSubmissionByTaskId = async (req: Request, res: Response) => {
        try {
            const { taskId } = req.params;
            const taskSubmissionGetByIdPayload: ItaskSubmissionGetByIdPayload = {
                taskId,
            }
            const taskSubmissionGetByIdResponse: ItaskSubmissionGetByIdResponse = await this._taskSubmissionService.getTaskSubmissionByTaskId(taskSubmissionGetByIdPayload);

            res.status(StatusCodes.OK).json(taskSubmissionGetByIdResponse);
        } //eslint-disable-next-line
        catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
}
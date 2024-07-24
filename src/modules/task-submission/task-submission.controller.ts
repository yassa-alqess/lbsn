
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TaskSubmissionService from './task-submission.service';
import { ITaskSubmissionAddPayload, ItaskSubmissionGetPayload, ItaskSubmissionGetResponse, ITaskSubmissionUpdatePayload } from '../../shared/interfaces/task-submission';
export default class TaskSubmissionController {
    constructor(private readonly taskSubmissionService: TaskSubmissionService) { }

    public addTaskSubmisson = async (req: Request, res: Response) => {
        try {
            const taskSubmissionAddPayload: ITaskSubmissionAddPayload = req.body;
            const path = req.file ? req.file.filename : '';
            const task = await this.taskSubmissionService.addTaskSubmisson(taskSubmissionAddPayload, path); // path may be empty string
            res.status(StatusCodes.CREATED).json(task);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };


    public updateTaskSubmisson = async (req: Request, res: Response) => {
        try {
            const taskSubmissionUpdatePayload: ITaskSubmissionUpdatePayload = req.body;
            const path = req.file ? req.file.filename : '';
            const task = await this.taskSubmissionService.updateTaskSubmisson(taskSubmissionUpdatePayload, path); // path may be empty string
            res.status(StatusCodes.CREATED).json(task);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

    public getTaskSubmission = async (req: Request, res: Response) => {
        try {
            const taskSubmissionGetPayload: ItaskSubmissionGetPayload = req.body;
            const taskSubmissionGetResponse: ItaskSubmissionGetResponse = await this.taskSubmissionService.getTaskSubmission(taskSubmissionGetPayload);

            res.status(StatusCodes.OK).json(taskSubmissionGetResponse);
        } //eslint-disable-next-line
        catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
}
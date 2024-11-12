// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, CAREERS_PATH, JOBS_PATH } from '../../../shared/constants';
import { Controller } from '../../../shared/interfaces/controller.interface';
import { IJobAddPayload, IJobUpdatePayload } from './jobs.interface';
import JobsService from './jobs.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../../shared/middlewares';
import { RoleEnum } from '../../../shared/enums';
import { CreateJobDto, UpdateJobDto } from './jobs.dto';
import { AlreadyExistsException, InvalidIdException, InternalServerException, NotFoundException, ParamRequiredException } from '../../../shared/exceptions';
import logger from '../../../config/logger';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class JobsController implements Controller {

    path = `/${CAREERS_PATH}/${JOBS_PATH}`;
    router = express.Router();
    private _jobsService = new JobsService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`${this.path}/:jobId`, this.getJob);
        this.router.get(`${this.path}`, this.getJobs);

        this.router.all(`${this.path}*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))
        this.router.post(this.path, validate(CreateJobDto), this.addJob);
        this.router.patch(`${this.path}/:jobId`, validate(UpdateJobDto), this.updateJob);
        this.router.delete(`${this.path}/:jobId`, this.deleteJob);
    }

    public addJob = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const jobPayload: IJobAddPayload = req.body;
            const job = await this._jobsService.addJob(jobPayload);
            res.status(StatusCodes.CREATED).json(job).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at AddJob action ${error}`);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Job', 'title', req.body.title.toString()));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateJob = async (req: Request, res: Response, next: NextFunction) => {
        const { jobId } = req.params;
        if (!jobId) return next(new ParamRequiredException('jobId'));
        try {
            const jobUpdatePayload: IJobUpdatePayload = {
                ...req.body,
                jobId
            }
            const job = await this._jobsService.updateJob(jobUpdatePayload);
            res.status(StatusCodes.OK).json(job).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateJob action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('jobId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Job', 'title', req.body.title.toString()));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getJob = async (req: Request, res: Response, next: NextFunction) => {
        const { jobId } = req.params;
        if (!jobId) return next(new ParamRequiredException('jobId'));
        try {
            const job = await this._jobsService.getJob(jobId);
            res.status(StatusCodes.OK).json(job).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetJob action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('jobId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getJobs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const jobss = await this._jobsService.getJobs();
            res.status(StatusCodes.OK).json(jobss).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetJobs action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public deleteJob = async (req: Request, res: Response, next: NextFunction) => {
        const { jobId } = req.params;
        if (!jobId) return next(new ParamRequiredException('jobId'));
        try {
            await this._jobsService.deleteJob(jobId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('jobId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}

// file dependinces
import { IApplicationAddPayload, IApplicationsGetPayload, IApplicationUpdatePayload, } from './applications.interface';
import { INVALID_UUID, CAREERS_PATH, APPLICATIONS_PATH } from '../../../shared/constants';
import { Controller } from '../../../shared/interfaces/controller.interface';
import ApplicationsService from './applications.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../../shared/middlewares';
import { InternalServerException, InvalidEnumValueException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../../shared/exceptions';
import logger from '../../../config/logger';
import { CreateApplicationDto, UpdateApplicationDto } from './applications.dto';
import upload from '../../../config/storage/multer.config';
import { ApplicationStatusEnum, RoleEnum } from '../../../shared/enums';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';


export default class ApplicationsController implements Controller {
    path = `/${CAREERS_PATH}/${APPLICATIONS_PATH}`;
    router = express.Router();
    private _applicationsService = new ApplicationsService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.post(`${this.path}`, upload(`${this.path}`)!.single("file"), validate(CreateApplicationDto), this.addApplication);

        // admin routes
        this.router.all(`${this.path}*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]));
        this.router.get(`${this.path}/all`, this.getAllApplications);
        this.router.get(`${this.path}`, this.getApplications);
        this.router.get(`${this.path}/:applicationId`, this.getApplication);
        this.router.patch(`${this.path}/:applicationId`, validate(UpdateApplicationDto), this.updateApplication);
        this.router.delete(`${this.path}/:applicationId`, this.deleteApplication);

    }

    public addApplication = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const path = req.file ? req.file.filename : '';
            if (!path) throw new ParamRequiredException('file');
            const applicationPayload: IApplicationAddPayload = {
                ...req.body,
                resume: path
            }
            const application = await this._applicationsService.addApplication(applicationPayload);
            res.status(StatusCodes.CREATED).json(application).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at addApplication action', error);
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public getApplications = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { jobTitle, status, limit = 10, page = 1 } = req.query;
            if (status && !Object.values(ApplicationStatusEnum).includes(status as ApplicationStatusEnum)) {
                throw new InvalidEnumValueException('ApplicationStatus');
            }
            const payload: IApplicationsGetPayload = {
                jobTitle: jobTitle as string,
                status: status as ApplicationStatusEnum,
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
            };
            const applications = await this._applicationsService.getApplications(payload);
            res.status(StatusCodes.OK).json(applications).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at getApplications action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                if (error instanceof InvalidEnumValueException || error instanceof ParamRequiredException) {
                    return next(error);
                }
                next(new InternalServerException(error.message));
            }
        };
    }

    public getApplication = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { applicationId } = req.params;
            if (!applicationId) throw new ParamRequiredException('applicationId');
            const application = await this._applicationsService.getApplication(applicationId);
            res.status(StatusCodes.OK).json(application).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetApplication action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('applicationId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateApplication = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { applicationId } = req.params;
            if (!applicationId) throw new ParamRequiredException('applicationId');

            const applicationUpdatePayload: IApplicationUpdatePayload = {
                ...req.body,
                applicationId,
            }
            const application = await this._applicationsService.updateApplication(applicationUpdatePayload);
            res.status(StatusCodes.OK).json(application).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateApplication action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('applicationId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { applicationId } = req.params;
            if (!applicationId) throw new ParamRequiredException('applicationId');
            await this._applicationsService.deleteApplication(applicationId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('applicationId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit = 10, page = 1 } = req.query;

            const payload: IApplicationsGetPayload = {
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
            }
            const applications = await this._applicationsService.getAllApplications(payload);
            res.status(StatusCodes.OK).json(applications).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getAllApplications action ${error}`);
            next(new InternalServerException(error.message));
        }
    }
}
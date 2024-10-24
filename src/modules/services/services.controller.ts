// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, SERVICES_PATH } from '../../shared/constants';
import { IServiceAddPayload, IServicesBulkAddPayload, IServiceUpdatePayload } from './services.interface';
import { Controller } from '../../shared/interfaces/controller.interface';
import ServicesService from './services.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { RoleEnum } from '../../shared/enums';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import { BulkAddServicesDto, CreateServiceDto, UpdateServiceDto } from './services.dto';
import logger from '../../config/logger';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class ServicesController implements Controller {

    path = `/${SERVICES_PATH}`;
    router = express.Router();
    private _servicesService = new ServicesService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`${this.path}/:serviceId`, this.getService);
        this.router.get(this.path, this.getServices);

        this.router
            .all(`${this.path}*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))
        this.router.post(this.path, validate(CreateServiceDto), this.addService);
        this.router.patch(`${this.path}/:serviceId`, validate(UpdateServiceDto), this.updateService);
        this.router.delete(`${this.path}/:serviceId`, this.deleteService);
        this.router.post(`${this.path}/bulk`, validate(BulkAddServicesDto), this.bulkAddServices);
    }

    public addService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const serviceAddPayload: IServiceAddPayload = req.body;
            const service = await this._servicesService.addService(serviceAddPayload);
            res.status(StatusCodes.CREATED).json(service).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at AddService action ${error}`);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Service', 'name', req.body.name));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateService = async (req: Request, res: Response, next: NextFunction) => {
        const { serviceId } = req.params;
        if (!serviceId) return next(new ParamRequiredException('serviceId'));
        try {
            const serviceUpdatePayload: IServiceUpdatePayload = {
                ...req.body,
                serviceId
            }
            const service = await this._servicesService.updateService(serviceUpdatePayload);
            res.status(StatusCodes.OK).json(service).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateService action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('serviceId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Service', 'name', req.body.name));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getService = async (req: Request, res: Response, next: NextFunction) => {

        const { serviceId } = req.params;
        if (!serviceId) return next(new ParamRequiredException('serviceId'));

        try {
            const service = await this._servicesService.getService(serviceId);
            res.status(StatusCodes.OK).json(service).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetService action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('serviceId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getServices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { categoryId } = req.query;
            const services = await this._servicesService.getServices(categoryId as string); //filter by categoryId if provided
            res.status(StatusCodes.OK).json(services).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetServices action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public deleteService = async (req: Request, res: Response, next: NextFunction) => {
        const { serviceId } = req.params;
        if (!serviceId) return next(new ParamRequiredException('serviceId'));

        try {
            await this._servicesService.deleteService(serviceId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at DeleteService action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('serviceId'));
            }
            if (error instanceof NotFoundException) {
                return next(new NotFoundException('Service', 'serviceId', serviceId));
            }
            next(new InternalServerException(error.message));
        }
    }

    public bulkAddServices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bulkAddServicesPayload: IServicesBulkAddPayload = req.body;
            const bulkAddServicesResponse = await this._servicesService.bulkAddServices(bulkAddServicesPayload);
            res.status(StatusCodes.CREATED).json(bulkAddServicesResponse).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error at bulkAddServices action: ${error}`);
            next(new InternalServerException(error.message));
        }
    };
}
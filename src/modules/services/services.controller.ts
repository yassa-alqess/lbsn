// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, SERVICES_PATH } from '../../shared/constants';
import { IServiceAddPayload, IServiceUpdatePayload } from './services.interface';
import Controller from '../../shared/interfaces/controller.interface';
import ServiceService from './services.service';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import accessTokenGuard from '../../shared/middlewares/access-token.mw';
import { requireAnyOfThoseRoles } from '../../shared/middlewares/role.mw';
import { RoleEnum } from '../../shared/enums';

export default class ServiceController implements Controller {

    path = SERVICES_PATH;
    router = express.Router();
    private _serviceService = new ServiceService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`${this.path}/:id`, this.getService);
        this.router.get(this.path, this.getServices);

        this.router.use(accessTokenGuard);
        this.router.use(requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]));
        this.router.post(this.path, this.addService);
        this.router.patch(`${this.path}/:id`, this.updateService);
        this.router.delete(`${this.path}/:id`, this.deleteService);
    }

    public addService = async (req: Request, res: Response) => {
        try {
            const serviceAddPayload: IServiceAddPayload = req.body;
            const service = await this._serviceService.addService(serviceAddPayload);
            res.status(StatusCodes.CREATED).json(service);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Service already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            // next(error);
        }
    }

    public updateService = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const serviceUpdatePayload: IServiceUpdatePayload = {
                ...req.body,
                serviceId: id
            }
            const service = await this._serviceService.updateService(serviceUpdatePayload);
            res.status(StatusCodes.OK).json(service);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid serviceId' });
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Service already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public getService = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const service = await this._serviceService.getService(id);
            res.status(StatusCodes.OK).json(service);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid serviceId' });
            }
            res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
        }
    }

    public getServices = async (req: Request, res: Response) => {
        try {
            const services = await this._serviceService.getServices();
            res.status(StatusCodes.OK).json(services);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public deleteService = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this._serviceService.deleteService(id);
            res.status(StatusCodes.OK).json({ id });
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid serviceId' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
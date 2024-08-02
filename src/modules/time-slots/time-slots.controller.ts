// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, GUESTS_PATH } from '../../shared/constants';
import Controller from '../../shared/interfaces/controller.interface';
import { ITimeSlotAddPayload, ITimeSlotUpdatePayload } from './time-slots.interface';
import TimeSlotsService from './time-slots.service';
import { accessTokenGuard, requireAnyOfThoseRoles } from '../../shared/middlewares';
import { RoleEnum } from '../../shared/enums';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TimeSlotsController implements Controller {

    path = GUESTS_PATH;
    router = express.Router();
    private _timeSlotsService = new TimeSlotsService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.use(accessTokenGuard);
        this.router.use(requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]));
        this.router.post(this.path, this.addTimeSlot);
        this.router.patch(`${this.path}/:id`, this.updateTimeSlot);
        this.router.get(`${this.path}/:id`, this.getTimeSlot);
        this.router.get(`${this.path}/:activated?`, this.getTimeSlots);
        this.router.delete(`${this.path}/:id`, this.deleteTimeSlot);
    }

    public addTimeSlot = async (req: Request, res: Response) => {
        try {
            const timeSlotAddPayload: ITimeSlotAddPayload = req.body;
            const timeSlots = await this._timeSlotsService.addTimeSlot(timeSlotAddPayload);
            res.status(StatusCodes.CREATED).json(timeSlots);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'TimeSlot already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            // next(error);
        }
    }

    public updateTimeSlot = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const timeSlotUpdatePayload: ITimeSlotUpdatePayload = {
                ...req.body,
                timeSlotId: id
            }
            const timeSlot = await this._timeSlotsService.updateTimeSlot(timeSlotUpdatePayload);
            res.status(StatusCodes.OK).json(timeSlot);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid timeSlotId' });
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'TimeSlot already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public getTimeSlot = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const timeSlot = await this._timeSlotsService.getTimeSlot(id);
            res.status(StatusCodes.OK).json(timeSlot);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid timeSlotsId' });
            }
            res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
        }
    }

    public getTimeSlots = async (req: Request, res: Response) => {
        try {
            const { activated } = req.params;
            const flag = activated === 'true' ? true : activated === 'false' ? false : undefined;
            const timeSlotss = await this._timeSlotsService.getTimeSlots(flag);
            res.status(StatusCodes.OK).json(timeSlotss);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public deleteTimeSlot = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this._timeSlotsService.deleteTimeSlot(id);
            res.status(StatusCodes.OK).json({ id });
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid timeSlotId' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
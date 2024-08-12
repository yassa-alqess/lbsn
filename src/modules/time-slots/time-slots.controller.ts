// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, TIME_SLOTS_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces/controller.interface';
import { ITimeSlotAddPayload, ITimeSlotUpdatePayload } from './time-slots.interface';
import TimeSlotsService from './time-slots.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { IsAvailableEnum, RoleEnum } from '../../shared/enums';
import { CreateTimeSlotDto, getTimeSlotsDto, UpdateTimeSlotDto } from './time-slots.dto';
import { AlreadyExistsException, InvalidIdException, InternalServerException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import logger from '../../config/logger';
import HttpException from '../../shared/exceptions/http.exception';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TimeSlotsController implements Controller {

    path = TIME_SLOTS_PATH;
    router = express.Router();
    private _timeSlotsService = new TimeSlotsService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`${this.path}/:timeSlotId`, this.getTimeSlot);
        this.router.get(`${this.path}`, this.getTimeSlots);

        this.router.all(`${this.path}/*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]));
        this.router.post(this.path, validate(CreateTimeSlotDto), this.addTimeSlot);
        this.router.patch(`${this.path}/:timeSlotId`, validate(UpdateTimeSlotDto), this.updateTimeSlot);
        this.router.delete(`${this.path}/:timeSlotId`, this.deleteTimeSlot);
    }

    public addTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const timeSlotAddPayload: ITimeSlotAddPayload = req.body;
            const timeSlot = await this._timeSlotsService.addTimeSlot(timeSlotAddPayload);
            res.status(StatusCodes.CREATED).json(timeSlot).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at AddTimeSlot action ${error}`);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('TimeSlot', 'time', req.body.time.toString()));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
        const { timeSlotId } = req.params;
        if (!timeSlotId) return next(new ParamRequiredException('TimeSlot', 'timeSlotId'));
        try {
            const timeSlotUpdatePayload: ITimeSlotUpdatePayload = {
                ...req.body,
                timeSlotId
            }
            const timeSlot = await this._timeSlotsService.updateTimeSlot(timeSlotUpdatePayload);
            res.status(StatusCodes.OK).json(timeSlot).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateTimeSlot action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('TimeSlot', timeSlotId));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('TimeSlot', 'time', req.body.time.toString()));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
        const { timeSlotId } = req.params;
        if (!timeSlotId) return next(new ParamRequiredException('TimeSlot', 'timeSlotId'));
        try {
            const timeSlot = await this._timeSlotsService.getTimeSlot(timeSlotId);
            res.status(StatusCodes.OK).json(timeSlot).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetTimeSlot action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('TimeSlot', timeSlotId));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getTimeSlots = async (req: Request, res: Response, next: NextFunction) => {
        const { isAvailable } = req.query;
        const flag = isAvailable ? isAvailable as IsAvailableEnum : undefined;
        const { error } = getTimeSlotsDto.validate({ isAvailable: flag });
        if (error) {
            return next(new HttpException(StatusCodes.BAD_REQUEST, error.details?.[0].message));
        }
        try {
            const timeSlotss = await this._timeSlotsService.getTimeSlots(flag);
            res.status(StatusCodes.OK).json(timeSlotss).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetTimeSlots action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public deleteTimeSlot = async (req: Request, res: Response, next: NextFunction) => {
        const { timeSlotId } = req.params;
        if (!timeSlotId) return next(new ParamRequiredException('TimeSlot', 'timeSlotId'));
        try {
            await this._timeSlotsService.deleteTimeSlot(timeSlotId);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('TimeSlot', timeSlotId));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
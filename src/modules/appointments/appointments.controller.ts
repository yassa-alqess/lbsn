// file dependencies
import { Controller } from '../../shared/interfaces/controller.interface';
import { APPOINTMENTS_PATH } from '../../shared/constants';
import AppointmentService from './appointments.service';
import { CreateAppointmentDto } from './appointments.dto';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { IAppointmentsAddPayload } from './appointments.interface';
import logger from '../../config/logger';
import { InternalServerException } from '../../shared/exceptions';
import { RoleEnum } from '../../shared/enums';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';


export default class AppointmentController implements Controller {

    path = APPOINTMENTS_PATH;
    router = express.Router();
    private _appointmentService = new AppointmentService();

    constructor() {
        this._initializeRoutes();
    }
    private _initializeRoutes() {
        //  guests can make appointment, so there is no auth required
        this.router.post(this.path, validate(CreateAppointmentDto), this.makeAppointment);
        this.router.get(this.path, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.getAppointments);
    }
    public makeAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentPayload: IAppointmentsAddPayload = req.body;
            const appointment = await this._appointmentService.makeAppointment(appointmentPayload);
            res.status(StatusCodes.CREATED).json({ appointment }).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at makeAppointment action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public getAppointments = async (req: Request, res: Response, next: NextFunction) => {
        const { guestId } = req.query;
        try {
            const appointments = await this._appointmentService.getAppointments(guestId as string);
            res.status(StatusCodes.OK).json(appointments).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getAppointments action ${error}`);
            next(new InternalServerException(error.message));
        }
    }
}
// file dependencies
import { Controller } from '../../shared/interfaces/controller.interface';
import { APPOINTMENTS_PATH } from '../../shared/constants';
import AppointmentService from './appointments.service';
import { CreateAppointmentDto } from './appointments.dto';
import { validate } from '../../shared/middlewares';
import { IAppointmentsAddPayload } from './appointments.interface';
import logger from '../../config/logger';
import { InternalServerException } from '../../shared/exceptions';

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
    }
    public makeAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentPayload: IAppointmentsAddPayload = req.body;
            await this._appointmentService.makeAppointment(appointmentPayload);
            res.status(StatusCodes.CREATED).end(); //not interested in returning anything

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at makeAppointment action ${error}`);
            next(new InternalServerException(error.message));
        }
    }
}
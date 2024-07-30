// file dependencies
import { IAppointmentPayload } from './appointment.interface';
import Controller from '../../shared/interfaces/controller.interface';
import { APPOINTMENTS_PATH } from '../../shared/constants';
import AppointmentService from './appointments.service';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class AppointmentController implements Controller {

    path = APPOINTMENTS_PATH;
    router = express.Router();
    private _appointmentService = new AppointmentService();

    constructor() {
        this._initializeRoutes();
    }
    private _initializeRoutes() {
        this.router.post(this.path, this.makeAppointment); //  guests can make appointment, so there is no auth required
    }
    public makeAppointment = async (req: Request, res: Response) => {
        try {
            const appointmentPayload: IAppointmentPayload = req.body;
            await this._appointmentService.makeAppointment(appointmentPayload);
            res.status(StatusCodes.CREATED); //not interested in returning anything
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
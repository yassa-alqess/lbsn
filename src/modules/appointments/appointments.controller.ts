import { AppointmentPayload } from '@/shared/interfaces/appointment';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppointmentService from './appointments.service';
export default class AppointmentController {
    constructor(private readonly authService: AppointmentService) { }

    public makeAppointment = async (req: Request, res: Response) => {
        try {
            const appointmentPayload: AppointmentPayload = req.body;
            await this.authService.makeAppointment(appointmentPayload);
            res.status(StatusCodes.CREATED); //not interested in returning anything
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
//file dependinces
import { IGuestAddPayload, IGuestResponse } from "../guests/guests.interface";
import { IAppointment, IAppointmentsAddPayload, IAppointmentsGetAllPayload, IAppointmentsGetPayload, IAppointmentsResponse } from "./appointments.interface";
import { IEmailOptions } from "../../config/mailer/email.interface";
import GuestService from "../guests/guests.service";
import logger from "../../config/logger";
import EmailService from "../../config/mailer";
import GuestRequestsService from "../guest-requests/guest-requests.service";
import MeetingService from "../meetings/meeting.service";
import Appointment from "../../shared/models/appointment";
import TimeSlot from "../../shared/models/time-slot";
import Guest from "../../shared/models/guest";
import { IGuestRequestAddPayload } from "../guest-requests/guest-requests.interface";
import { ACQUISITION_MAIL, MAIN_MAIL } from "../../shared/constants";
import { IMeeting } from "../meetings/meeting.interface";
import { hashPassword } from "../../shared/utils/hash-password";
import TimeSlotService from "../time-slots/time-slots.service";
import { ITimeSlotResponse } from "../time-slots/time-slots.interface";
import { IsAvailableEnum } from "../../shared/enums";


export default class AppointmentService {
    private _guestService = new GuestService();
    private _guestRequestsService = new GuestRequestsService();
    private _emailService = new EmailService();
    private _meetingService = new MeetingService();
    private _timeSlotService = new TimeSlotService();

    /**
     * the order is very importent, it's like a transaction...
     * the guest & guest requests can be added and with the cron job will be deleted if the appointment is not created later
     * but if the meating is not created, then we can't proceed with the appointment creation
     * also if there is any error in the mail service, the appointment should not be created
     */
    public async makeAppointment(appointmentPayload: IAppointmentsAddPayload): Promise<IAppointment> {
        // prepare meeting
        const meeting = await this._prepareMeeting(appointmentPayload);

        // add to table guests
        const guest = await this._guestService.getOrCreateGuest(this._mapAppointmentToGuest(appointmentPayload));

        // add to table guest-services
        const guestRequest: IGuestRequestAddPayload = {
            guestId: guest.guestId,
            requestId: appointmentPayload.serviceId,
            marketingBudget: appointmentPayload.marketingBudget
        };
        await this._guestRequestsService.addGuestRequest({
            ...guestRequest
        });

        // send confirmation email
        await this._sendConfirmationEmail(guest, meeting);

        // create appointment record after the meeting is prepared & the guest-request-record is created & the email is sent
        return await this._createAppointmentRecord(guest, appointmentPayload, meeting);
    }

    private _mapAppointmentToGuest(appointmentPayload: IAppointmentsAddPayload): IGuestAddPayload {
        return {
            username: appointmentPayload.username,
            companyName: appointmentPayload.companyName,
            companyEmail: appointmentPayload.companyEmail,
            companyPhone: appointmentPayload.companyPhone,
            companyAddress: appointmentPayload.companyAddress,
            companyTaxId: appointmentPayload.companyTaxId,
        };
    }

    private async _createAppointmentRecord(
        guest: IGuestResponse,
        appointmentPayload: IAppointmentsAddPayload,
        meeting: IMeeting,
    ): Promise<IAppointment> {
        try {
            const hashedPassword = await hashPassword(meeting.password as string);

            const appointment = await Appointment.create({
                guestEmail: guest.companyEmail,
                meetingUrl: meeting.start_url,
                meetingJoinUrl: meeting.join_url,
                meetingPassword: hashedPassword,
                guestId: guest.guestId,
                serviceId: appointmentPayload.serviceId,
                timeSlotId: appointmentPayload.timeSlotId,

            });

            return {
                appointmentId: appointment.appointmentId,
                guestEmail: appointment.guestEmail,
                meetingUrl: appointment.meetingUrl,
                meetingJoinUrl: appointment.meetingJoinUrl,
                guestId: appointment.guestId,
                serviceId: appointment.serviceId,
                timeSlotId: appointment.timeSlotId,
                time: meeting.time,
            }
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Couldn't Create An Appointment, ${err.message}`);
            throw new Error(`Couldn't Create An Appointment: ${err.message}`);
        }
    }

    private async _sendConfirmationEmail(
        guest: IGuestResponse,
        meeting: IMeeting,
    ): Promise<void> {
        const formatedDate = new Date(meeting.time).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        const emailPayload: IEmailOptions = {
            to: guest.companyEmail,
            cc: [MAIN_MAIL, ACQUISITION_MAIL],
            template: "appointment",
            subject: 'Appointment Confirmation',
            context: {
                joinUrl: meeting.join_url,
                meetingPassword: meeting.password,
                meetingTime: formatedDate,
                meetingDuration: '1 hr',
            },
        };
        await this._emailService.sendEmail(emailPayload);
    }

    private async _prepareMeeting(appointmentPayload: IAppointmentsAddPayload): Promise<IMeeting> {
        try {
            const { time, isAvailable } = await this._timeSlotService.getTimeSlot(appointmentPayload.timeSlotId as string) as ITimeSlotResponse; //will throw error if not found

            if (isAvailable === IsAvailableEnum.UNAVAILABLE) {
                throw new Error('Time is already allocated');
            }

            return await this._meetingService.scheduleMeeting("meeting invitation", time);
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Couldn't prepare meeting ${err.message}`);
            throw new Error(`Couldn't prepare meeting: ${err.message}`);
        }
    }

    public async getAppointments(payload: IAppointmentsGetPayload): Promise<IAppointmentsResponse | undefined> {
        const { guestId, limit, offset } = payload;
        const { rows: appointments, count } = await Appointment.findAndCountAll({
            where: {
                ...(guestId && { guestId }),
            },
            include: [
                {
                    model: TimeSlot,
                    attributes: ['time'],
                },
            ],
            limit,
            offset
        });
        return {
            appointments: appointments.map(appointment => ({
                appointmentId: appointment.appointmentId,
                guestEmail: appointment.guestEmail,
                meetingUrl: appointment.meetingUrl,
                meetingJoinUrl: appointment.meetingJoinUrl,
                guestId: appointment.guestId,
                serviceId: appointment.serviceId,
                timeSlotId: appointment.timeSlotId,
                time: appointment.timeSlot?.time,
            })),
            total: count,
            pages: Math.ceil(count / limit)
        };
    }

    //get all appointments & guet user name
    public async getAllAppointments(payload: IAppointmentsGetAllPayload): Promise<IAppointmentsResponse | undefined> {
        const { limit, offset } = payload;
        const { rows: appointments, count } = await Appointment.findAndCountAll({
            include: [
                {
                    model: TimeSlot,
                    attributes: ['time'],
                },
                {
                    model: Guest,
                    attributes: ['companyEmail', 'username'],
                }
            ],
            limit,
            offset
        });

        return {
            appointments: appointments.map(appointment => ({
                appointmentId: appointment.appointmentId,
                guestEmail: appointment.guestEmail,
                guestUsername: appointment.guest?.username,
                meetingUrl: appointment.meetingUrl,
                meetingJoinUrl: appointment.meetingJoinUrl,
                guestId: appointment.guestId,
                serviceId: appointment.serviceId,
                timeSlotId: appointment.timeSlotId,
                time: appointment.timeSlot?.time,
            })),
            total: count,
            pages: Math.ceil(count / limit)
        };
    }
}
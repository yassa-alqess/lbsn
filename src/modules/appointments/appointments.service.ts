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
import Service from "../../shared/models/service";
import Category from "../../shared/models/category";
import { IGuestRequestAddPayload } from "../guest-requests/guest-requests.interface";
import { ACQUISITION_MAIL, MAIN_MAIL } from "../../shared/constants";
import { IMeeting } from "../meetings/meeting.interface";
import { hashPassword } from "../../shared/utils/hash-password";
import TimeSlotService from "../time-slots/time-slots.service";
import { ITimeSlotResponse } from "../time-slots/time-slots.interface";
import { IsAvailableEnum, IsUserEnum } from "../../shared/enums";


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
            serviceId: appointmentPayload.serviceId,
            categoryId: appointmentPayload.categoryId,
            marketingBudget: appointmentPayload.marketingBudget
        };
        const { requestId } = await this._guestRequestsService.addGuestRequest({
            ...guestRequest,
            isUser: IsUserEnum.GUEST
        });

        // send confirmation email
        await this._sendConfirmationEmail(guest, meeting);

        // create appointment record after the meeting is prepared & the guest-request-record is created & the email is sent
        return await this._createAppointmentRecord(requestId, guest, appointmentPayload, meeting);
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
        requestId: string,
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
                requestId,
                guestId: guest.guestId,
                serviceId: appointmentPayload.serviceId,
                categoryId: appointmentPayload.categoryId,
                timeSlotId: appointmentPayload.timeSlotId,
            });

            const service = await Service.findByPk(appointmentPayload.serviceId); //i'm sure it's there
            const category = await Category.findByPk(appointmentPayload.categoryId); //i'm sure it's there

            return {
                appointmentId: appointment.appointmentId,
                guestEmail: appointment.guestEmail,
                meetingUrl: appointment.meetingUrl,
                meetingJoinUrl: appointment.meetingJoinUrl,
                requestId: appointment.requestId,
                guestId: appointment.guestId,
                serviceId: appointment.serviceId,
                serviceName: service?.name as string,
                categoryId: appointment.categoryId,
                categoryName: category?.name as string,
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
                {
                    model: Service,
                    attributes: ['name'],
                },
                {
                    model: Category,
                    attributes: ['name'],
                }
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
                requestId: appointment.requestId,
                guestId: appointment.guestId,
                serviceId: appointment.serviceId,
                serviceName: appointment.service?.name,
                categoryId: appointment.categoryId,
                categoryName: appointment.category?.name,
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
                    attributes: ['username'],
                },
                {
                    model: Service,
                    attributes: ['name'],
                },
                {
                    model: Category,
                    attributes: ['name'],
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
                requestId: appointment.requestId,
                guestId: appointment.guestId,
                serviceId: appointment.serviceId,
                serviceName: appointment.service?.name,
                categoryId: appointment.categoryId,
                categoryName: appointment.category?.name,
                timeSlotId: appointment.timeSlotId,
                time: appointment.timeSlot?.time,
            })),
            total: count,
            pages: Math.ceil(count / limit)
        };
    }
}
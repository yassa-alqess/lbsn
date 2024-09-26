//file dependinces
import { IGuestAddPayload, IGuestResponse } from "../guests/guests.interface";
import { IAppointment, IAppointmentsAddPayload, IAppointmentsResponse } from "./appointments.interface";
import { IEmailOptions } from "../../config/mailer/email.interface";
import GuestService from "../guests/guests.service";
import logger from "../../config/logger";
import EmailService from "../../config/mailer";
import GuestRequestsService from "../guest-requests/guest-requests.service";
import MeetingService from "../meetings/meeting.service";
import { generateRandomPassword } from "../../shared/utils";
import Appointment from "../../shared/models/appointment";
import { IGuestRequestAddPayload } from "../guest-requests/guest-requests.interface";
import { ACQUISITION_MAIL, MAIN_MAIL } from "../../shared/constants";
import { IMeeting } from "../meetings/meeting.interface";
import { hashPassword } from "../../shared/utils/hash-password";


export default class AppointmentService {
    private _guestService = new GuestService();
    private _guestRequestsService = new GuestRequestsService();
    private _emailService = new EmailService();
    private _meetingService = new MeetingService();

    public async makeAppointment(appointmentPayload: IAppointmentsAddPayload) {
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

        // prepare meeting
        const meetingPassword = generateRandomPassword(); //sync procedure
        const hashedPassword = await hashPassword(meetingPassword);
        const meeting = await this._meetingService.scheduleMeeting("meeting invitation", appointmentPayload.timeSlot, meetingPassword);

        // create appointment
        await this._createAppointmentRecord(guest, appointmentPayload, meeting, hashedPassword);

        // send confirmation email
        await this._sendConfirmationEmail(guest, appointmentPayload, meeting, meetingPassword);
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
        hashedPassword: string
    ): Promise<void> {
        try {
            await Appointment.create({
                time: appointmentPayload.timeSlot,
                guestEmail: guest.companyEmail,
                meetingUrl: meeting.start_url,
                meetingJoinUrl: meeting.join_url,
                meetingPassword: hashedPassword,
                guestId: guest.guestId,
                serviceId: appointmentPayload.serviceId
            });
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Couldn't Create An Appointment, ${err.message}`);
            throw new Error(`Couldn't Create An Appointment`);
        }
    }

    private async _sendConfirmationEmail(
        guest: IGuestResponse,
        appointmentPayload: IAppointmentsAddPayload,
        meeting: IMeeting,
        meetingPassword: string
    ): Promise<void> {
        const formatedDate = new Date(appointmentPayload.timeSlot).toLocaleString('en-US', {
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
                meetingPassword,
                meetingTime: formatedDate,
                meetingDuration: '1 hr',
            },
        };
        await this._emailService.sendEmail(emailPayload);
    }

    public async getAppointments(guestId: string): Promise<IAppointmentsResponse | undefined> {
        const appointments = await Appointment.findAll({
            where: {
                ...(guestId && { guestId }),
            }
        });
        return {
            appointments: appointments.map(appointment => ({
                ...appointment.toJSON() as IAppointment
            }))
        };
    }
}
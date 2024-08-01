//file dependinces
import { IGuestAddPayload } from "../guests/guests.interface";
import { IAppointmentsAddPayload } from "./appointment.interface";
import { IEmailOptions } from "../../config/mailer/email.interface";
import GuestService from "../guests/guests.service";
import logger from "../../config/logger";
import { GuestAlreadyExistsError } from "../../shared/errors";
import EmailService from "../../config/mailer";
import { ACQUISITION_MAIL } from "../../shared/constants";
import GuestRequestsService from "../guest-requests/guest-requests.service";
import MeetingService from "../meetings/meeting.service";
import generateRandomPassword from "../../shared/utils/random-password";
import Appointment from "../../shared/models/appointment";

// 3rd party dependencies
import bcrypt from "bcrypt";

export default class AppointmentService {
    private _guestService = new GuestService();
    private _guestRequestsService = new GuestRequestsService();
    private _emailService = new EmailService();
    private _meetingService = new MeetingService();
    public async makeAppointment(appointmentPayload: IAppointmentsAddPayload) {

        // add to table guests
        const guestData: IGuestAddPayload = {
            email: appointmentPayload.email,
            name: appointmentPayload.name,
            taxId: appointmentPayload.taxId,
            companyName: appointmentPayload.companyName,
            phone: appointmentPayload.phone,
            location: appointmentPayload.location,
        }

        let guest;
        try {
            guest = await this._guestService.addGuest(guestData);
        } catch (err) {
            if (err instanceof GuestAlreadyExistsError) {
                logger.info('Guest already exists');
            }
        }

        // add to table guest-services
        this._guestRequestsService.addGuestRequest(guest!.guestId, appointmentPayload.serviceId);

        // generate random password for meeting
        const meetingPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(meetingPassword, 10);

        // create a zoom meeting with requested time    
        const meeting = await this._meetingService.sheduleMeeting("meeting invitation", appointmentPayload.timeSlot, meetingPassword);

        // add to apppointment table the url
        await Appointment.create({ time: appointmentPayload.timeSlot, guestEmail: guest!.email, meetingUrl: meeting.start_url, meetingJoinUrl: meeting.join_url, meetingPassword: hashedPassword, guestId: guest!.guestId });


        // send email to the user
        // send email to the admin  sales@domain.com
        const emailPayload: IEmailOptions = {
            to: [guest!.email, ACQUISITION_MAIL],
            template: "appointment",
            subject: 'Appointment Confirmation',
            context: {
                name: appointmentPayload.name,
                joinUrl: meeting.join_url,
                meetingPassword,
                meetingTime: appointmentPayload.timeSlot,
                meetingDuration: '1 hr',
            },
        };
        await this._emailService.sendEmail(emailPayload);
    }
} 
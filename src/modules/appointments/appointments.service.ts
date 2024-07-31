//file dependinces
import { IGuestAddPayload } from "../guests/guests.interface";
import { IAppointmentsAddPayload } from "./appointment.interface";
import GuestService from "../guests/guests.service";
import logger from "../../config/logger";
import { GuestAlreadyExistsError } from "../../shared/errors";
import GuestRequestsService from "../guest-requests/guest-requests.service";
import EmailService from "../../config/mailer";
import { IEmailOptions } from "../../config/mailer/email.interface";
import { ACQUISITION_MAIL } from "../../shared/constants";

export default class AppointmentService {
    private _guestService = new GuestService();
    private _guestRequestsService = new GuestRequestsService();
    private _emailService = new EmailService();
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

        // create a zoom meeting with requested time    
        // add to apppointment table the url
        // send email to the user
        // send email to the admin ?? sales@domain.com
        const emailPayload: IEmailOptions = {
            to: [appointmentPayload.email, ACQUISITION_MAIL],
            template: "appointment",
            subject: 'Appointment Confirmation',
            context: {
                name: appointmentPayload.name,
                // meetingUrl: meetingUrl,
                meetingTime: appointmentPayload.timeSlot,
                meetingDuration: '1 hr',
            },
        };
        await this._emailService.sendEmail(emailPayload);
    }
} 
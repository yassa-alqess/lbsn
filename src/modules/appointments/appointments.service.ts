//file dependinces
import { IGuestAddPayload } from "../guests/guests.interface";
import { IAppointmentsAddPayload } from "./appointments.interface";
import { IEmailOptions } from "../../config/mailer/email.interface";
import GuestService from "../guests/guests.service";
import logger from "../../config/logger";
import EmailService from "../../config/mailer";
import GuestRequestsService from "../guest-requests/guest-requests.service";
import MeetingService from "../meetings/meeting.service";
import { generateRandomPassword } from "../../shared/utils";
import Appointment from "../../shared/models/appointment";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IGuestRequestAddPayload } from "../guest-requests/guest-requests.interface";
import { ACQUISITION_MAIL, MAIN_MAIL } from "../../shared/constants";

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
            ...appointmentPayload,
        }

        let guest;
        try {
            guest = await this._guestService.getGuestByEmail(appointmentPayload.email);
            //eslint-disable-next-line
        } catch (err: any) {
            if (err instanceof NotFoundException) {
                logger.info(err.message);
                // Guest not found, so we should proceed to create a new guest.
                try {
                    guest = await this._guestService.addGuest(guestData);
                    logger.debug(`Guest created with ID: ${guest.guestId}`);
                    //eslint-disable-next-line
                } catch (err: any) {
                    if (err instanceof AlreadyExistsException) {
                        logger.info("Guest already exists, proceeding.");
                    } else {
                        logger.error(`Couldn't create a guest: ${err.message}`);
                        throw new Error(`Couldn't create a guest`);
                    }
                }
            } else {
                logger.error(`Couldn't Get A Guest, ${err.message}`);
                throw new Error(`Couldn't Get A Guest, ${err.message}`);
            }
        }

        // add to table guest-services
        try {
            logger.debug(`Adding Guest Request for ${guest!.guestId} and service ${appointmentPayload.serviceId}`);
            const guestRequest: IGuestRequestAddPayload = {
                guestId: guest!.guestId,
                requestId: appointmentPayload.serviceId,
                marketingBudget: appointmentPayload.marketingBudget
            }
            await this._guestRequestsService.addGuestRequest(guestRequest);
            //eslint-disable-next-line
        } catch (err: any) {
            if (err instanceof AlreadyExistsException) {
                logger.info(err.message);
            }
            else {
                logger.error(`Couldn't Create A Guest Request, ${err.message}`);
                throw new Error(`Couldn't Create A Guest Request, ${err.message}`);
            }
        }


        // generate random password for meeting
        const meetingPassword = generateRandomPassword();
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(meetingPassword, 10);
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Couldn't Hash The Password, ${err.message}`);
            throw new Error(`Couldn't Hash The Password`);
        }

        // create a zoom meeting with requested time  
        let meeting;
        try {

            meeting = await this._meetingService.scheduleMeeting("meeting invitation", appointmentPayload.timeSlot, meetingPassword);
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Couldn't Create A Meeting, ${err.message}`);
            throw new Error(`Couldn't Create A Meeting`);
        }
        
        // add to apppointment table the url
        try {
            
            await Appointment.create({ time: appointmentPayload.timeSlot, guestEmail: guest!.email, meetingUrl: meeting.start_url, meetingJoinUrl: meeting.join_url, meetingPassword: hashedPassword, guestId: guest!.guestId });
            //eslint-disable-next-line
        } catch (err: any) {
            
            logger.error(`Couldn't Create An Appointment, ${err.message}`);
            throw new Error(`Couldn't Create An Appointment`);
        }
        
        // get formated (user-readable) Date
        // send email to the user
        // send email to the admin  sales@domain.com
        const formatedDate = new Date(appointmentPayload.timeSlot).toLocaleString('en-US', {
            weekday: 'long', // e.g., 'Thursday'
            year: 'numeric', // e.g., '2024'
            month: 'long', // e.g., 'August'
            day: 'numeric', // e.g., '8'
            hour: 'numeric', // e.g., '7 AM'
            minute: 'numeric', // e.g., '00'
            hour12: true // Use 12-hour time format
        });
        const emailPayload: IEmailOptions = {
            to: [guest!.email, MAIN_MAIL, ACQUISITION_MAIL],
            template: "appointment",
            subject: 'Appointment Confirmation',
            context: {
                // name: appointmentPayload.name,
                joinUrl: meeting.join_url,
                meetingPassword,
                meetingTime: formatedDate,
                meetingDuration: '1 hr',
            },
        };
        await this._emailService.sendEmail(emailPayload);
    }
}
import { MAIN_MAIL } from "../../shared/constants";
import EmailService from "../../config/mailer";
import { ContactUsPostPayload } from "./contact-us.interface";
import logger from "../../config/logger";

export default class ContactUsService {
    private _emailService = new EmailService();

    public async contactUsPost(contactUsPayload: ContactUsPostPayload): Promise<void> {
        try {

            await this._emailService.sendEmail({
                to: MAIN_MAIL,
                subject: 'Contact Us',
                template: 'contact-us',
                context: {
                    fullName: contactUsPayload.fullName,
                    email: contactUsPayload.email,
                    phone: contactUsPayload.phone,
                    message: contactUsPayload.message,
                }
            });
        }

        // eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error at contactUsPost service ${error.message}`);
            throw new Error(`Error at contactUs service ${error.message}`);
        }
    }
}
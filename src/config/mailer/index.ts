//file dependinces
import { MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_USER } from '../../shared/constants';
import { IEmailOptions } from './email.interface';
import logger from '../logger';

//3rd party dependinces
import { pugEngine } from 'nodemailer-pug-engine';
import path from 'path';
import nodemailer from 'nodemailer';

export default class EmailService {
    private _transporter: nodemailer.Transporter;
    constructor() {
        // Create a transporter object
        this._transporter = nodemailer.createTransport({
            host: MAIL_HOST as string,
            port: parseInt(MAIL_PORT),
            secure: true, // use SSL
            auth: {
                user: MAIL_USER,
                pass: MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // disable SSL verification 
            },
        });
        this._initTransporter();
    }

    // Attach the Pug template engine to the transporter
    private _initTransporter() {
        this._transporter.use('compile', pugEngine({
            templateDir: path.join(__dirname, 'templates'),
        }));
    }

    public sendEmail = async (options: IEmailOptions) => {
        // for each options.to craft email and send.

        /**
         *  options.to.forEach((to) => {
            const mailOptions = {
                from: MAIL_USER,
                to,
                subject: options.subject,
                template: options.template,
                ctx: options.context,
            };

            logger.debug(`Sending email with options: ${JSON.stringify(mailOptions)}`);
            this._transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    logger.error(`Error sending email to ${mailOptions.to} with error: ${error.message}`);
                } else {
                    logger.info(`Email sent to ${mailOptions.to} with message ID: ${info.messageId}`);
                }
            });
        });
        */
        await Promise.all(
            options.to.map(async (to) => {
                const mailOptions = {
                    from: MAIL_USER,
                    to,
                    subject: options.subject,
                    template: options.template,
                    ctx: options.context,
                };
                try {
                    const info = await this._transporter.sendMail(mailOptions);
                    logger.info(`Email sent to ${to} with message ID: ${info.messageId}`);
                    //eslint-disable-next-line
                } catch (error: any) {
                    logger.error(`Error sending email to ${to}: ${error.message}`);
                }
            })
        );
    };
}
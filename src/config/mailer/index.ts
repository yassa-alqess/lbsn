//file dependinces
import { MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_USER } from '../../shared/constants';
import { IEmailOptions } from './email.interface';
import { pugEngine } from 'nodemailer-pug-engine';
import path from 'path';
import logger from '../logger';

//3rd party dependinces
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
        options.to.forEach(async (to) => {
            const mailOptions = {
                from: MAIL_USER,
                to: to,
                subject: options.subject,
                template: options.template,
                ctx: options.context,
            };

            try {
                await this._transporter.sendMail(mailOptions);
                logger.info('Email sent successfully to:', to);
            } catch (error) {
                logger.error('Error sending email:', error);
            }
        });
    };
}
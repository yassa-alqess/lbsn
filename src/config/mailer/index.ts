import { MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_USER } from '../../shared/constants';
import { IEmailOptions } from '../../shared/interfaces/email';
import nodemailer from 'nodemailer';
import { pugEngine } from 'nodemailer-pug-engine';
import path from 'path';
// Create a transporter object
const transporter = nodemailer.createTransport({
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

// Attach the Pug template engine to the transporter
transporter.use('compile', pugEngine({
    templateDir: path.join(__dirname, 'templates'),
}));

export const sendEmail = async (options: IEmailOptions) => {
    const mailOptions = {
        from: MAIL_USER,
        to: options.to,
        subject: options.subject,
        template: options.template,
        ctx: options.context,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
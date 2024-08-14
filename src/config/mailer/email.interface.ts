export interface IEmailOptions {
    to: string;
    cc?: string[]; // Optional array for CC recipients
    subject: string;
    template: string;
    // eslint-disable-next-line
    context: { [key: string]: any };
}

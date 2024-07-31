export interface IEmailOptions {
    to: string[];
    subject: string;
    template: string;
    //eslint-disable-next-line
    context: { [key: string]: any };
}
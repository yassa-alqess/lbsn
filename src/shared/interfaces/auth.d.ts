import { IAuthPayload } from './auth'; // Adjust the import path as necessary

declare global {
    namespace Express {
        interface Request {
            user?: IAuthPayload;
        }
    }
}

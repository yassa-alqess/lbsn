import { IAuthPayload } from '../interfaces/auth'; // Adjust the import path as necessary

declare global {
    namespace Express {
        interface Request {
            user?: IAuthPayload;
        }
    }
}

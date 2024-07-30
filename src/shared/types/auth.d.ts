import { IAuthPayload } from '../../modules/auth/auth.interface'; // Adjust the import path as necessary

declare global {
    namespace Express {
        interface Request {
            user?: IAuthPayload;
        }
    }
}

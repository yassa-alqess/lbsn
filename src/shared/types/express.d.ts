import { IAuthPayload } from '../../modules/auth/auth.interface';

declare global {
    namespace Express {
        interface User extends IAuthPayload { }

        interface Request {
            user?: User;
        }
    }
}

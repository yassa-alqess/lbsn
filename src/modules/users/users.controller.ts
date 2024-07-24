import { StatusCodes } from 'http-status-codes';
import UserService from './users.service';
import { Request, Response } from 'express';
import { IUserAddPayload, IUserUpdatePayload } from '@/shared/interfaces/user';
import { INVALID_UUID, DUPLICATE_ERR } from '@/shared/constants';
// import { Role } from '../../shared/enums';

export default class UserController {
    constructor(private readonly userService: UserService) { }


    public addUser = async (req: Request, res: Response) => {
        try {
            const userAddPayload: IUserAddPayload = req.body;
            const user = await this.userService.addUser(userAddPayload);
            res.status(StatusCodes.CREATED).json(user);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            // next(error);
        }
    }

    // get xlsx sheet and get all the users from it and add them to the database (all required feilds should be present in the sheet)
    public bulkAddUsers = async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
            }
            const { role } = req.body;
            if (!role) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Role is required' });
            }

            const users = this.userService.bulkAddUsers(req.file.path, role); // req.file.filename
            res.status(StatusCodes.CREATED).json(users);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public updateUser = async (req: Request, res: Response) => {
        try {
            const userUpdatePayload: IUserUpdatePayload = req.body;
            const user = await this.userService.updateUser(userUpdatePayload);
            res.status(StatusCodes.OK).json(user);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid userId' });
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public getUser = async (req: Request, res: Response) => {
        try {
            const { userId } = req.body;
            const user = await this.userService.getUser(userId);
            res.status(StatusCodes.OK).json(user);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid userId' });
            }
            res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
        }
    }

    public getUsers = async (req: Request, res: Response) => {
        try {
            const users = await this.userService.getUsers();
            res.status(StatusCodes.OK).json(users);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public deleteUser = async (req: Request, res: Response) => {
        try {
            const { userId } = req.body;
            await this.userService.deleteUser(userId);
            res.status(StatusCodes.OK).json({ userId });
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid userId' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
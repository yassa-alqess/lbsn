// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, USERS_PATH } from '../../shared/constants';
import { IUserAddPayload, IUserUpdatePayload } from './user.interface';
import Controller from '../../shared/interfaces/controller.interface';
import UserService from './users.service';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class UserController implements Controller {

    path = USERS_PATH;
    router = express.Router();
    private _userService = new UserService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.post(this.path, this.addUser);
        this.router.post(`${this.path}/bulk`, this.bulkAddUsers);
        this.router.patch(`${this.path}/:id`, this.updateUser);
        this.router.get(`${this.path}/:id`, this.getUser);
        this.router.get(this.path, this.getUsers);
        this.router.delete(`${this.path}/:id`, this.deleteUser);
    }

    public addUser = async (req: Request, res: Response) => {
        try {
            const userAddPayload: IUserAddPayload = req.body;
            const user = await this._userService.addUser(userAddPayload);
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

            const users = this._userService.bulkAddUsers(req.file.path, role); // req.file.filename
            res.status(StatusCodes.CREATED).json(users);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public updateUser = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userUpdatePayload: IUserUpdatePayload = {
                ...req.body,
                userId: id
            }
            const user = await this._userService.updateUser(userUpdatePayload);
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
            const { id } = req.params;
            const user = await this._userService.getUser(id);
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
            const users = await this._userService.getUsers();
            res.status(StatusCodes.OK).json(users);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public deleteUser = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this._userService.deleteUser(id);
            res.status(StatusCodes.OK).json({ id });
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid userId' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
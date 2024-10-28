// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, USERS_PATH } from '../../shared/constants';
import { IUserAddPayload, IUsersGetPayload, IUserUpdateInfoPayload, IUserUpdatePayload } from './users.interface';
import { Controller } from '../../shared/interfaces/controller.interface';
import UserService from './users.service';
import { RoleEnum } from '../../shared/enums';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import upload from '../../config/storage/multer.config';
import { CreateUserDto, UpdateUserDto, UpdateUserInfoDto } from './users.dto';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NoFileUploadedException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import logger from '../../config/logger';
import { IAuthPayload } from '../auth/auth.interface';


// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';


export default class UserController implements Controller {

    path = `/${USERS_PATH}`;
    router = express.Router();
    private _userService = new UserService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.path}*`, accessTokenGuard);
        this.router.patch(`${this.path}/me`, upload(`${this.path}/images`)!.single("file"), validate(UpdateUserInfoDto), this.updateInfo);
        this.router.get(`${this.path}/me`, this.getInfo);

        this.router.all(`${this.path}*`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))
        this.router.post(this.path, upload(`${this.path}/images`)!.single("file"), validate(CreateUserDto), this.addUser);
        this.router.post(`${this.path}/bulk`, upload(this.path)!.single("file"), this.bulkAddUsers);
        this.router.patch(`${this.path}/:userId`, upload(`${this.path}/images`)!.single("file"), validate(UpdateUserDto), this.updateUser);
        this.router.get(this.path, this.getUsers);
        this.router.get(`${this.path}/:userId/requests`, this.getUserRequests);
        this.router.get(`${this.path}/:userId`, this.getUser);
        this.router.delete(`${this.path}/:userId`, this.deleteUser);
    }

    public addUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const path = req.file ? req.file.filename : '';
            logger.debug(`req.file.filename: ${JSON.stringify(req.file?.filename)}`);
            const userAddPayload: IUserAddPayload = {
                ...req.body,
                image: path
            };
            const user = await this._userService.addUser(userAddPayload);
            res.status(StatusCodes.CREATED).json(user).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at AddUser action ${error}`);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('User', 'email', req.body.email));
            }
            next(new InternalServerException(error.message));
        }
    }

    // get xlsx sheet and get all the users from it and add them to the database (all required feilds should be present in the sheet)
    public bulkAddUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return next(new NoFileUploadedException());
            }

            const users = this._userService.bulkAddUsers(req.file.path); // req.file.filename
            res.status(StatusCodes.CREATED).json(users).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at bulkAddUsers action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        if (!userId) {
            return next(new ParamRequiredException('userId'));
        }
        try {
            const path = req.file ? req.file.filename : '';
            const userUpdatePayload: IUserUpdatePayload = {
                ...req.body,
                userId,
                image: path
            }
            logger.debug(`req.file.filename: ${JSON.stringify(req.file)}`);
            const user = await this._userService.updateUser(userUpdatePayload);
            res.status(StatusCodes.OK).json(user).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at updateUser action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('userId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('User', 'email', req.body.email));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getUser = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        if (!userId) return next(new ParamRequiredException('userId'));
        try {
            const user = await this._userService.getUser(userId);
            res.status(StatusCodes.OK).json(user).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getUser action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('userId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit = 10, page = 1 } = req.query;
            const usersGetPayload: IUsersGetPayload = {
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
            }
            const users = await this._userService.getUsers(usersGetPayload);
            res.status(StatusCodes.OK).json(users).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getUsers action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public getUserRequests = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        if (!userId) {
            return next(new ParamRequiredException('userId'));
        }
        try {
            const requests = await this._userService.getUserRequests(userId);
            res.status(StatusCodes.OK).json(requests).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getUserRequests action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('userId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;
        if (!userId) {
            return next(new ParamRequiredException('userId'));
        }
        try {
            await this._userService.deleteUser(userId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at deleteUser action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('userId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getInfo = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.user as IAuthPayload;
        try {
            const user = await this._userService.getUser(id);
            res.status(StatusCodes.OK).json(user).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getInfo action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public updateInfo = async (req: Request, res: Response, next: NextFunction) => {
        const { id: userId } = req.user as IAuthPayload;

        try {
            const path = req.file ? req.file.filename : '';
            const userUpdatePayload: IUserUpdateInfoPayload = {
                ...req.body,
                userId,
                image: path
            }
            logger.debug(`req.file.filename: ${JSON.stringify(req.file)}`);
            const user = await this._userService.updateUser(userUpdatePayload);
            res.status(StatusCodes.OK).json(user).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at updateUserInfo action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('userId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('User', 'email', req.body.email));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
// file dependinces
import { DUPLICATE_ERR, INVALID_UUID, PROFILES_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces';
import UserProfilesService from './user-profiles.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { RoleEnum } from '../../shared/enums';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import { createProfileDto } from './user-profiles.dto';
import { IAuthPayload } from '../auth/auth.interface';
import { IProfileAddPayload } from './user-profiles.interface';
import logger from '../../config/logger';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class UserProfilesController implements Controller {

    path = `/${PROFILES_PATH}`;
    router = express.Router();
    private _userProfilesService = new UserProfilesService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(this.path, accessTokenGuard, this.getUserProfiles);
        this.router.get(`${this.path}/all`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.getUserProfilesByUserId);
        this.router.post(this.path, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), validate(createProfileDto), this.addUserProfile);
    }

    public addUserProfile = async (req: Request, res: Response, next: NextFunction) => {
        const { id: userId } = req.user as IAuthPayload;
        try {
            const payload: IProfileAddPayload = {
                ...req.body,
                userId
            }
            const userProfile = await this._userProfilesService.addUserProfile(payload);
            res.status(StatusCodes.CREATED).json(userProfile).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at addUserProfile action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('userId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Profile', 'name', req.body.name));
            }
            if (error instanceof NotFoundException || error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getUserProfiles = async (req: Request, res: Response, next: NextFunction) => {
        const { id: userId } = req.user as IAuthPayload;
        try {
            const userProfiles = await this._userProfilesService.getUserProfiles(userId);
            res.status(StatusCodes.OK).json(userProfiles).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getUserProfiles action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('userId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getUserProfilesByUserId = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.query;
        if (!userId) {
            return next(new ParamRequiredException('userId'));
        }
        try {
            const userProfiles = await this._userProfilesService.getUserProfiles(userId as string);
            res.status(StatusCodes.OK).json(userProfiles).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getUserProfiles action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('userId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
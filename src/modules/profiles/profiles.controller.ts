// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, PROFILES_PATH } from '../../shared/constants';
import { IProfileUpdatePayload } from './profiles.interface';
import { Controller } from '../../shared/interfaces/controller.interface';
import ProfileService from './profiles.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import { updateProfileDto } from './profiles.dto';
import { RoleEnum } from '../../shared/enums';
import logger from '../../config/logger';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class ProfileController implements Controller {

    path = PROFILES_PATH;
    router = express.Router();
    private _profileProfile = new ProfileService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.path}*`, accessTokenGuard)
        this.router.patch(`${this.path}/:profileId`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), validate(updateProfileDto), this.updateProfile);
        this.router.get(`${this.path}/:profileId`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.getProfile);
        this.router.delete(`${this.path}/:profileId`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.deleteProfile);
    }

    public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        const { profileId } = req.params;
        if (!profileId) {
            return next(new ParamRequiredException('profileId'));
        }
        try {
            const profileUpdatePayload: IProfileUpdatePayload = {
                ...req.body,
                profileId
            }
            const profile = await this._profileProfile.updateProfile(profileUpdatePayload);
            res.status(StatusCodes.OK).json(profile).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at updateProfile action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('profileId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Profile', 'name', req.body.name));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getProfile = async (req: Request, res: Response, next: NextFunction) => {
        const { profileId } = req.params;
        if (!profileId) {
            return next(new ParamRequiredException('profileId'));
        }
        try {
            const profile = await this._profileProfile.getProfile(profileId);
            res.status(StatusCodes.OK).json(profile).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getProfile action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('profileId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
        const { profileId } = req.params;
        if (!profileId) {
            return next(new ParamRequiredException('profileId'));
        }
        try {
            await this._profileProfile.deleteProfile(profileId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at deleteProfile action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('profileId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
// file dependinces
import { DUPLICATE_ERR, USERS_PATH } from '../../shared/constants';
import Controller from '../../shared/interfaces/controller.interface';
import UserProfilesService from './user-profiles.service';
import { accessTokenGuard } from '../../shared/middlewares';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class UserProfilesController implements Controller {

    path = USERS_PATH;
    router = express.Router();
    private _userProfilesService = new UserProfilesService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.use(accessTokenGuard);
        this.router.post(`${this.path}/:userId/profiles/:profileId`, this.addUserProfile);
        this.router.get(`${this.path}/:userId/profiles`, this.getUserProfiles);
        this.router.delete(`${this.path}/:userId/profiles/:profileId`, this.deleteUserProfile);
    }

    public addUserProfile = async (req: Request, res: Response) => {
        try {
            const { userId, profileId } = req.params;
            const userProfile = await this._userProfilesService.addUserProfile(userId, profileId);
            res.status(StatusCodes.CREATED).json(userProfile);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User profile already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public getUserProfiles = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const userProfiles = await this._userProfilesService.getUserProfiles(userId);
            res.status(StatusCodes.OK).json(userProfiles);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public deleteUserProfile = async (req: Request, res: Response) => {
        try {
            const { userId, profileId } = req.params;
            await this._userProfilesService.deleteUserProfile(userId, profileId);
            res.status(StatusCodes.NO_CONTENT).send();
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
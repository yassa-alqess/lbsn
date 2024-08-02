// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, SERVICES_PATH } from '../../shared/constants';
import { IProfileUpdatePayload } from './profiles.interface';
import Controller from '../../shared/interfaces/controller.interface';
import ProfileService from './profiles.service';
import { accessTokenGuard } from '../../shared/middlewares';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class ProfileController implements Controller {

    path = SERVICES_PATH;
    router = express.Router();
    private _profileProfile = new ProfileService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.use(accessTokenGuard);
        this.router.get(`${this.path}/:id`, this.getProfile);
        this.router.patch(`${this.path}/:id`, this.updateProfile);
        this.router.delete(`${this.path}/:id`, this.deleteProfile);
    }

    public updateProfile = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const profileUpdatePayload: IProfileUpdatePayload = {
                ...req.body,
                profileId: id
            }
            const profile = await this._profileProfile.updateProfile(profileUpdatePayload);
            res.status(StatusCodes.OK).json(profile);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid profileId' });
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Profile already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public getProfile = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const profile = await this._profileProfile.getProfile(id);
            res.status(StatusCodes.OK).json(profile);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid profileId' });
            }
            res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
        }
    }

    public deleteProfile = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this._profileProfile.deleteProfile(id);
            res.status(StatusCodes.OK).json({ id });
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid profileId' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
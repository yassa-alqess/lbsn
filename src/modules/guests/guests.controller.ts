// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, GUESTS_PATH } from '../../shared/constants';
import { IGuestAddPayload, IGuestUpdatePayload } from './guests.interface';
import Controller from '../../shared/interfaces/controller.interface';
import GuestService from './guests.service';
import { RoleEnum } from '../../shared/enums';
import { accessTokenGuard, requireAnyOfThoseRoles} from '../../shared/middlewares';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class GuestController implements Controller {

    path = GUESTS_PATH;
    router = express.Router();
    private _guestService = new GuestService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.use(accessTokenGuard);
        this.router.use(requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]));
        this.router.post(this.path, this.addGuest);
        this.router.patch(`${this.path}/:id`, this.updateGuest);
        this.router.get(`${this.path}/:id`, this.getGuest);
        this.router.get(this.path, this.getGuests);
        this.router.delete(`${this.path}/:id`, this.deleteGuest);
        this.router.post(`${this.path}/approve/:id`, this.approveGuest);
        this.router.get(`${this.path}/email/:email`, this.getGuestByEmail);
    }
    public addGuest = async (req: Request, res: Response) => {
        try {
            const guestAddPayload: IGuestAddPayload = req.body;
            const guest = await this._guestService.addGuest(guestAddPayload);
            res.status(StatusCodes.CREATED).json(guest);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Guest already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
            // next(error);
        }
    }

    public updateGuest = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const guestUpdatePayload: IGuestUpdatePayload = {
                ...req.body,
                guestId: id
            }
            const guest = await this._guestService.updateGuest(guestUpdatePayload);
            res.status(StatusCodes.OK).json(guest);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid guestId' });
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Guest already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public getGuest = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const guest = await this._guestService.getGuest(id);
            res.status(StatusCodes.OK).json(guest);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid guestId' });
            }
            res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
        }
    }

    public getGuests = async (req: Request, res: Response) => {
        try {
            const guests = await this._guestService.getGuests();
            res.status(StatusCodes.OK).json(guests);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public deleteGuest = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this._guestService.deleteGuest(id);
            res.status(StatusCodes.OK).json({ id });
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid guestId' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
    public approveGuest = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this._guestService.approveGuest(id);
            res.status(StatusCodes.OK).json({ id });
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid guestId' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public getGuestByEmail = async (req: Request, res: Response) => {
        try {
            const { email } = req.params;
            const guest = await this._guestService.getGuestByEmail(email);
            res.status(StatusCodes.OK).json(guest);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
        }
    }
}
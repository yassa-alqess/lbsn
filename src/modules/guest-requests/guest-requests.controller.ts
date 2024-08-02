// file dependinces
import { DUPLICATE_ERR, GUESTS_PATH } from '../../shared/constants';
import Controller from '../../shared/interfaces/controller.interface';
import GuestRequestsService from './guest-requests.service';
import { RoleEnum } from '../../shared/enums';
import { accessTokenGuard, requireAnyOfThoseRoles } from '../../shared/middlewares';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';


export default class GuestRequestsController implements Controller {

    path = GUESTS_PATH;
    router = express.Router();
    private _guestRequestsService = new GuestRequestsService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.use(accessTokenGuard);
        this.router.use(requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]));
        this.router.post(`${this.path}/:guestId/requests/:requestId`, this.addGuestRequest);
        this.router.get(`${this.path}/:guestId/requests`, this.getGuestRequests);
        this.router.delete(`${this.path}/:guestId/requests/:requestId`, this.deleteGuestRequest);
        this.router.post(`${this.path}/:guestId/requests/:requestId/approve`, this.approveGuestRequest);
    }

    public addGuestRequest = async (req: Request, res: Response) => {
        try {
            const { guestId, requestId } = req.params;
            const guestRequest = await this._guestRequestsService.addGuestRequest(guestId, requestId);
            res.status(StatusCodes.CREATED).json(guestRequest);
            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Guest request already exists' });
            }
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public getGuestRequests = async (req: Request, res: Response) => {
        try {
            const { guestId } = req.params;
            const guestRequests = await this._guestRequestsService.getGuestRequests(guestId);
            res.status(StatusCodes.OK).json(guestRequests);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public deleteGuestRequest = async (req: Request, res: Response) => {
        try {
            const { guestId, requestId } = req.params;
            await this._guestRequestsService.deleteGuestRequest(guestId, requestId);
            res.status(StatusCodes.NO_CONTENT).send();
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }

    public approveGuestRequest = async (req: Request, res: Response) => {
        try {
            const { guestId, requestId } = req.params;
            await this._guestRequestsService.approveGuestRequest(guestId, requestId);
            res.status(StatusCodes.OK).send();
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
}
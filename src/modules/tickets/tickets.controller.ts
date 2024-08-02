

// file dependinces
import { TICKETS_PATH } from '../../shared/constants';
import { ITicketResolvePayload, ITicketsAddPayload, ITicketsGetPayload } from './tickets.interface';
import Controller from '../../shared/interfaces/controller.interface';
import TicketService from './tickets.service';
import { RoleEnum } from '../../shared/enums';
import { accessTokenGuard, requireAnyOfThoseRoles } from '../../shared/middlewares';

// 3rd party dependencies
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TicketController implements Controller {

    path = TICKETS_PATH;
    router = express.Router();
    private _ticketService = new TicketService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.use(accessTokenGuard);
        this.router.post(this.path, this.addTicket);
        this.router.get(`${this.path}/:id/:status?`, this.getTickets);

        this.router.use(requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]));
        this.router.patch(`${this.path}/resolve`, this.resolveTicket);
    }

    public addTicket = async (req: Request, res: Response) => {
        try {
            const ticketPayload: ITicketsAddPayload = req.body;
            const path = req.file ? req.file.filename : '';
            await this._ticketService.addTicket(ticketPayload, path);
            res.status(StatusCodes.CREATED)
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

    public getTickets = async (req: Request, res: Response) => {
        try {
            const { id, status } = req.params;
            const payload: ITicketsGetPayload = {
                profileId: id,
                status: status ? parseInt(status) : 0
            }
            const tickets = await this._ticketService.getTickets(payload);
            res.status(StatusCodes.OK).json(tickets);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

    public resolveTicket = async (req: Request, res: Response) => {
        try {
            const ticketPayload: ITicketResolvePayload = req.body;
            await this._ticketService.resolveTicket(ticketPayload);
            res.status(StatusCodes.OK)
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
}
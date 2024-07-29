
import { ITicketResolvePayload, ITicketsAddPayload, ITicketsGetPayload } from '../../shared/interfaces/ticket';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TicketService from './tickets.service';
export default class TicketController {
    constructor(private readonly ticketService: TicketService) { }

    public addTicket = async (req: Request, res: Response) => {
        try {
            const ticketPayload: ITicketsAddPayload = req.body;
            const path = req.file ? req.file.filename : '';
            await this.ticketService.addTicket(ticketPayload, path);
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
            const tickets = await this.ticketService.getTickets(payload);
            res.status(StatusCodes.OK).json(tickets);
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    };

    public resolveTicket = async (req: Request, res: Response) => {
        try {
            const ticketPayload: ITicketResolvePayload = req.body;
            await this.ticketService.resolveTicket(ticketPayload);
            res.status(StatusCodes.OK)
            //eslint-disable-next-line
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
    }
}
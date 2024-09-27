import { ITicket, ITicketsAddPayload, ITicketsGetPayload, ITicketsGetResponse, ITicketsUpdatePayload } from "./tickets.interface";
import Ticket from "../../shared/models/ticket";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { TicketStatusEnum } from "../../shared/enums";
import logger from "../../config/logger";

export default class TicketService {
    public async addTicket(ticketPayload: ITicketsAddPayload): Promise<ITicket> {
        try {
            const ticket = await Ticket.findOne({ where: { title: ticketPayload.title, profileId: ticketPayload.profileId } });
            if (ticket) {
                throw new AlreadyExistsException("Ticket", "title", ticketPayload.title);
            }
            const newTicket = await Ticket.create({ ...ticketPayload, status: TicketStatusEnum.PENDING });
            const newTicketJson = newTicket.toJSON() as ITicket;
            return {
                ...newTicketJson,
            };
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Error adding ticket: ${err.message}`);
            if (err instanceof AlreadyExistsException) {
                throw err;
            }
            throw new Error(`Error adding ticket: ${err.message}`);
        }
    }

    public async getTickets(payload: ITicketsGetPayload): Promise<ITicketsGetResponse | undefined> {
        const tickets = await Ticket.findAll({
            where: {
                profileId: payload.profileId,
                ...(payload.status && { status: payload.status }),
            }
        });
        return {
            tickets: tickets.map(ticket => ({
                ...ticket.toJSON()
            }))
        };
    }

    public async resolveTicket(ticketId: string): Promise<void> {

        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) {
                throw new NotFoundException('Ticket', "ticketId", ticketId);
            }
            ticket.status = TicketStatusEnum.RESOLVED;
            await ticket.save();
        }  //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error resolving ticket: ${err.message}`);
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new Error(`Error resolving ticket: ${err.message}`);
        }
    }

    public async getTicket(ticketId: string): Promise<ITicket | undefined> {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            throw new NotFoundException('Ticket', "ticketId", ticketId);
        }

        const ticketJson = ticket.toJSON() as ITicket;
        return {
            ...ticketJson,
        };
    }

    public async updateTicket(ticketPayload: ITicketsUpdatePayload): Promise<ITicket | undefined> {
        const { ticketId } = ticketPayload;
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) {
                throw new NotFoundException('Ticket', 'ticketId', ticketId);
            }
            const newTicket = await ticket.update({ ...ticketPayload });
            const newTicketJson = newTicket.toJSON() as ITicket;
            return {
                ...newTicketJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating ticket: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating ticket: ${error.message}`);
        }
    }

    public async deleteTicket(ticketId: string): Promise<void> {
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) {
                throw new NotFoundException('Ticket', 'ticketId', ticketId);
            }
            await ticket.destroy();
        } //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error deleting ticket: ${err.message}`);
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new Error(`Error deleting ticket: ${err.message}`);
        }
    }
}
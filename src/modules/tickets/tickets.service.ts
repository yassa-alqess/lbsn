import { ITicket, ITicketsAddPayload, ITicketsGetPayload, ITicketsGetResponse, ITicketsUpdatePayload } from "./tickets.interface";
import Ticket from "../../shared/models/ticket";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { TicketStatusEnum } from "../../shared/enums";
import logger from "../../config/logger";
export default class TicketService {
    public async addTicket(ticketPayload: ITicketsAddPayload): Promise<ITicket> {
        const ticket = await Ticket.findOne({ where: { title: ticketPayload.title, profileId: ticketPayload.profileId } });
        if (ticket) {
            throw new AlreadyExistsException("Ticket", "title", ticketPayload.title);
        }
        try {
            const ticket = await Ticket.create({ ...ticketPayload, status: TicketStatusEnum.PENDING });
            return {
                ...ticket.toJSON()
            };
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Error adding ticket: ${err.message}`);
            throw new Error(`Error adding ticket`);
        }
    }

    public async getTickets(payload: ITicketsGetPayload): Promise<ITicketsGetResponse | undefined> {
        const tickets = await Ticket.findAll({
            where: {
                profileId: payload.profileId,
                status: payload.status
            }
        });
        return {
            tickets: tickets.map(ticket => ({
                ...ticket.toJSON()
            }))
        };
    }

    public async resolveTicket(ticketId: string): Promise<void> {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            throw new NotFoundException('Ticket', "ticketId", ticketId);
        }

        try {
            ticket.status = TicketStatusEnum.RESOLVED;
            await ticket.save();
        }  //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error resolving ticket: ${err.message}`);
            throw new Error(`Error resolving ticket`);
        }
        return;
    }

    public async getTicket(ticketId: string): Promise<ITicket | undefined> {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            throw new NotFoundException('Ticket', "ticketId", ticketId);
        }
        return {
            ...ticket.toJSON() as ITicket
        };
    }

    public async updateTicket(ticketPayload: ITicketsUpdatePayload): Promise<ITicket> {
        const { ticketId } = ticketPayload;
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            throw new NotFoundException('Ticket', 'ticketId', ticketId);
        }
        try {
            await ticket.update({ ...ticketPayload });
            return {
                ...ticket.toJSON() as ITicket
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating ticket: ${error.message}`);
            throw new Error(`Error updating ticket`);
        }
    }

    public async deleteTicket(ticketId: string): Promise<void> {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) {
            throw new NotFoundException('Ticket', 'ticketId', ticketId);
        }
        try {
            await ticket.destroy();
        } //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error deleting ticket: ${err.message}`);
            throw new Error(`Error deleting ticket`);
        }
    }
}
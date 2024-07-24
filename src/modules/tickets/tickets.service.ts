import { ITicket, ITicketResolvePayload, ITicketsAddPayload, ITicketsGetPayload, ITicketsGetResponse } from "@/shared/interfaces/ticket";
import Ticket from "../../shared/models/ticket";

export default class TicketService {
    constructor() {
    }

    public async addTicket(ticketPayload: ITicketsAddPayload, path: string): Promise<ITicket> {

        const ticket = await Ticket.create({ ...ticketPayload, documentUrl: path });
        return {
            ticketId: ticket.ticketId,
            // profileId: ticket.profile.profileId,
            title: ticket.title,
            comment: ticket.comment,
            status: ticket.status,
            documentUrl: ticket.documentUrl,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt
        };
    }

    public async getTickets(payload: ITicketsGetPayload): Promise<ITicketsGetResponse> {
        const tickets = await Ticket.findAll({
            where: {
                profileId: payload.profileId,
                status: payload.status
            }
        });
        return {
            tickets: tickets.map(ticket => ({
                ticketId: ticket.ticketId,
                // profileId: ticket.profile.profileId,
                title: ticket.title,
                comment: ticket.comment,
                documentUrl: ticket.documentUrl,
                status: ticket.status,
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt
            }))
        };
    }

    public async resolveTicket(payload: ITicketResolvePayload): Promise<void> {
        const ticket = await Ticket.findByPk(payload.ticketId);
        if (ticket) {
            ticket.status = payload.status;
            await ticket.save();
            return;
        }
        throw new Error('Ticket not found');
    }

}
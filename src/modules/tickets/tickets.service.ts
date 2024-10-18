import { ITicket, ITicketsAddPayload, ITicketsGetAllPayload, ITicketsGetPayload, ITicketsGetResponse, ITicketsUpdatePayload } from "./tickets.interface";
import Ticket from "../../shared/models/ticket";
import Profile from "../../shared/models/profile";
import User from "../../shared/models/user";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { TicketStatusEnum } from "../../shared/enums";
import logger from "../../config/logger";
import { TICKETS_FILES_PATH } from "../../shared/constants";
import ProfileService from "../profiles/profiles.service";
import { deleteFile, getFileSizeAsync } from "../../shared/utils";

// 3rd party dependencies
import path from 'path';

export default class TicketService {
    private _profileService = new ProfileService();
    public async addTicket(ticketPayload: ITicketsAddPayload): Promise<ITicket> {
        try {
            const ticket = await Ticket.findOne({ where: { title: ticketPayload.title, profileId: ticketPayload.profileId } });
            if (ticket) {
                throw new AlreadyExistsException("Ticket", "title", ticketPayload.title);
            }

            const profile = await this._profileService.getProfile(ticketPayload.profileId);
            if (!profile) {
                throw new NotFoundException("Profile", "profileId", ticketPayload.profileId);
            }

            const newTicket = await Ticket.create({ ...ticketPayload, status: TicketStatusEnum.PENDING });
            const newTicketJson = newTicket.toJSON() as ITicket;
            return {
                ...newTicketJson,
                documentUrl: newTicketJson.documentUrl ? newTicketJson.documentUrl : '',
                size: newTicketJson.documentUrl ? await getFileSizeAsync(path.join(TICKETS_FILES_PATH, newTicketJson.documentUrl)) : '0KB'
            };
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Error adding ticket: ${err.message}`);
            if (err instanceof AlreadyExistsException || err instanceof NotFoundException) {
                throw err;
            }
            throw new Error(`Error adding ticket: ${err.message}`);
        }
    }

    public async getTickets(payload: ITicketsGetPayload): Promise<ITicketsGetResponse | undefined> {
        const { limit, offset } = payload;
        const { rows: tickets, count } = await Ticket.findAndCountAll({
            where: {
                profileId: payload.profileId,
                ...(payload.status && { status: payload.status }),
            },
            limit,
            offset,
        });
        return {
            tickets: tickets.map(ticket => ({
                ...ticket.toJSON(),
                documentUrl: ticket.documentUrl ? ticket.documentUrl : ''
            })),
            total: count,
            pages: Math.ceil(count / (limit || 10))
        };
    }

    public async resolveTicket(ticketId: string): Promise<void> {
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) {
                throw new NotFoundException('Ticket', "ticketId", ticketId);
            }
            ticket.status = TicketStatusEnum.RESOLVED;
            ticket.resolvedAt = new Date();
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
            documentUrl: ticketJson.documentUrl ? ticketJson.documentUrl : '',
            size: ticketJson.documentUrl ? await getFileSizeAsync(path.join(TICKETS_FILES_PATH, ticketJson.documentUrl)) : '0KB'
        };
    }

    public async updateTicket(ticketPayload: ITicketsUpdatePayload): Promise<ITicket | undefined> {
        try {
            const { ticketId } = ticketPayload;
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) {
                throw new NotFoundException('Ticket', 'ticketId', ticketId);
            }

            // Delete old document if new document is uploaded
            const oldDocumentUrl = ticket.documentUrl;
            const newDocumentUrl = ticketPayload.documentUrl;
            if (newDocumentUrl && oldDocumentUrl !== newDocumentUrl) {
                deleteFile(path.join(TICKETS_FILES_PATH, oldDocumentUrl));
            }

            // if no new document is uploaded, keep the old document
            if (!newDocumentUrl) {
                ticketPayload.documentUrl = oldDocumentUrl;
            }

            const newTicket = await ticket.update({ ...ticketPayload });
            const newTicketJson = newTicket.toJSON() as ITicket;
            return {
                ...newTicketJson,
                documentUrl: newTicketJson.documentUrl ? newTicketJson.documentUrl : '',
                size: newTicketJson.documentUrl ? await getFileSizeAsync(path.join(TICKETS_FILES_PATH, newTicketJson.documentUrl)) : '0KB'
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating ticket: ${error.message} `);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating ticket: ${error.message} `);
        }
    }

    public async deleteTicket(ticketId: string): Promise<void> {
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) {
                throw new NotFoundException('Ticket', 'ticketId', ticketId);
            }
            await ticket.destroy();
            if (ticket.documentUrl) {
                deleteFile(path.join(TICKETS_FILES_PATH, ticket.documentUrl));
            }
        } //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error deleting ticket: ${err.message} `);
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new Error(`Error deleting ticket: ${err.message} `);
        }
    }

    public async getAllTickets(payload: ITicketsGetAllPayload): Promise<ITicketsGetResponse | undefined> {
        const { limit, offset } = payload;
        const { rows: tickets, count } = await Ticket.findAndCountAll({
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: ['profileId'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['username']
                        }
                    ]
                }
            ],
            limit,
            offset
        });

        return {
            tickets: tickets.map(ticket => ({
                ticketId: ticket.ticketId,
                title: ticket.title,
                comment: ticket.comment,
                status: ticket.status,
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt,
                resolvedAt: ticket.resolvedAt,
                profileId: ticket.profileId,
                username: ticket.profile.user.username, // Add username here
                documentUrl: ticket.documentUrl ? ticket.documentUrl : ''
            })),
            total: count,
            pages: Math.ceil(count / (limit || 10))
        };
    }
}
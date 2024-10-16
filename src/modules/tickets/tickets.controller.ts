

// file dependinces
import { DUPLICATE_ERR, INVALID_UUID, PROFILES_PATH, TICKETS_PATH } from '../../shared/constants';
import { ITicketsAddPayload, ITicketsGetPayload, ITicketsUpdatePayload } from './tickets.interface';
import { Controller } from '../../shared/interfaces/controller.interface';
import TicketService from './tickets.service';
import { RoleEnum, TicketStatusEnum } from '../../shared/enums';
import { accessTokenGuard, isOwnerOfProfileGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import upload from '../../config/storage/multer.config'
import { AlreadyExistsException, InternalServerException, InvalidEnumValueException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import logger from '../../config/logger';
import { CreateTicketDto, UpdateTicketDto } from './tickets.dto';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class TicketController implements Controller {
    path = TICKETS_PATH;
    profilesPath = `/${PROFILES_PATH}`;
    router = express.Router();
    private _ticketService = new TicketService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.patch(`/${this.path}/:ticketId/resolve`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.resolveTicket);


        // user routes
        this.router.all(`${this.profilesPath}/:profileId/${this.path}*`, accessTokenGuard, isOwnerOfProfileGuard); // protect all routes
        this.router.post(`${this.profilesPath}/:profileId/${this.path}`, upload(this.path)!.single("file"), validate(CreateTicketDto), this.addTicket);
        this.router.get(`${this.profilesPath}/:profileId/${this.path}`, this.getTickets);
        this.router.get(`${this.profilesPath}/:profileId/${this.path}/:ticketId`, this.getTicket);
        this.router.patch(`${this.profilesPath}/:profileId/${this.path}/:ticketId`, upload(this.path)!.single("file"), validate(UpdateTicketDto), this.updateTicket);
        this.router.delete(`${this.profilesPath}/:profileId/${this.path}/:ticketId`, this.deleteTicket);
    }

    public addTicket = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            if (!profileId) {
                throw new ParamRequiredException('profileId');
            }
            const path = req.file ? req.file.filename : '';
            const ticketPayload: ITicketsAddPayload = {
                ...req.body,
                profileId,
                documentUrl: path
            }
            const ticket = await this._ticketService.addTicket(ticketPayload);
            res.status(StatusCodes.CREATED).json(ticket).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at addTicket action', error);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Task', 'title', req.body.title));
            }
            if (error instanceof AlreadyExistsException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public getTickets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            if (!profileId) {
                throw new ParamRequiredException('profileId');
            }

            const { status, limit = 10, page = 1 } = req.query;
            if (status && !Object.values(TicketStatusEnum).includes(status as TicketStatusEnum)) {
                throw new InvalidEnumValueException('TicketStatus');
            }

            const payload: ITicketsGetPayload = {
                profileId: profileId as string,
                status: status as TicketStatusEnum,
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
            }
            const tickets = await this._ticketService.getTickets(payload);
            res.status(StatusCodes.OK).json(tickets).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at getTickets action', error);
            if (error instanceof InvalidEnumValueException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public resolveTicket = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ticketId } = req.params;
            if (!ticketId) throw new ParamRequiredException('ticketId');
            await this._ticketService.resolveTicket(ticketId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at resolveTicket action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('ticketId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getTicket = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ticketId } = req.params;
            if (!ticketId) throw new ParamRequiredException('ticketId');
            const ticket = await this._ticketService.getTicket(ticketId);
            res.status(StatusCodes.OK).json(ticket).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at getTicket action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('ticketId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateTicket = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ticketId } = req.params;
            if (!ticketId) throw new ParamRequiredException('ticketId');

            const path = req.file ? req.file.filename : '';
            const ticketUpdatePayload: ITicketsUpdatePayload = {
                ...req.body,
                ticketId,
                documentUrl: path
            }
            const ticket = await this._ticketService.updateTicket(ticketUpdatePayload);
            res.status(StatusCodes.OK).json(ticket).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at updateTicket action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('ticketId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Ticket', 'title', req.body.time.toString()));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ticketId } = req.params;
            if (!ticketId) throw new ParamRequiredException('ticketId');
            await this._ticketService.deleteTicket(ticketId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at deleteTicket action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('ticketId'));
            }
            if (error instanceof NotFoundException || error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
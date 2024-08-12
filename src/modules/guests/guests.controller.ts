// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, GUESTS_PATH } from '../../shared/constants';
import { IGuestAddPayload, IGuestUpdatePayload } from './guests.interface';
import { Controller } from '../../shared/interfaces/controller.interface';
import GuestService from './guests.service';
import { RoleEnum } from '../../shared/enums';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { CreateGuestDto, UpdateGuestDto } from './guests.dto';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import logger from '../../config/logger';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class GuestController implements Controller {

    path = GUESTS_PATH;
    router = express.Router();
    private _guestService = new GuestService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.path}/*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))
        this.router.post(this.path, validate(CreateGuestDto), this.addGuest);
        this.router.patch(`${this.path}/:guestId`, validate(UpdateGuestDto), this.updateGuest);
        this.router.get(`${this.path}/:guestId`, this.getGuest);
        this.router.get(this.path, this.getGuests);
        this.router.delete(`${this.path}/:guestId`, this.deleteGuest);
        this.router.post(`${this.path}/:guestId/approve`, this.approveGuest);
    }
    public addGuest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guestAddPayload: IGuestAddPayload = req.body;
            const guest = await this._guestService.addGuest(guestAddPayload);
            res.status(StatusCodes.CREATED).json(guest).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at addGuest action ${error}`);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Guest', 'email', req.body.email));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateGuest = async (req: Request, res: Response, next: NextFunction) => {
        const { guestId } = req.params;
        if (!guestId) return next(new ParamRequiredException('Guest', 'guestId'));
        try {
            const guestUpdatePayload: IGuestUpdatePayload = {
                ...req.body,
                guestId
            }
            const guest = await this._guestService.updateGuest(guestUpdatePayload);
            res.status(StatusCodes.OK).json(guest).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at updateGuest action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('Guest', guestId));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Guest', 'email', req.body.email));
            }
            if (error instanceof NotFoundException || error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getGuest = async (req: Request, res: Response, next: NextFunction) => {
        const { guestId } = req.params;
        if (!guestId) return next(new ParamRequiredException('Guest', 'guestId'));

        try {
            const guest = await this._guestService.getGuest(guestId);
            res.status(StatusCodes.OK).json(guest).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getGuest action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('Guest', guestId));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getGuests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guests = await this._guestService.getGuests();
            res.status(StatusCodes.OK).json(guests).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getGuests action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public deleteGuest = async (req: Request, res: Response, next: NextFunction) => {
        const { guestId } = req.params;
        if (!guestId) return next(new ParamRequiredException('Guest', 'guestId'));
        try {
            await this._guestService.deleteGuest(guestId);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at deleteGuest action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('Guest', guestId));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
    public approveGuest = async (req: Request, res: Response, next: NextFunction) => {
        const { guestId } = req.params;
        if (!guestId) return next(new ParamRequiredException('Guest', 'guestId'));

        try {
            await this._guestService.approveGuest(guestId);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at approveGuest action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('Guest', guestId));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getGuestByEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.query;
        if (!email) return next(new ParamRequiredException('Guest', 'email'));
        try {

            const guest = await this._guestService.getGuestByEmail(email as string);
            res.status(StatusCodes.OK).json(guest).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getGuestByEmail action ${error}`);
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
// file dependinces
import { INVALID_UUID, REQUESTS_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces/controller.interface';
import GuestRequestsService from './guest-requests.service';
import { RoleEnum } from '../../shared/enums';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import logger from '../../config/logger';
import { IGuestRequestAddPayload, IGuestRequestUpdatePayload } from './guest-requests.interface';
import { CreateGuestRequestDto, UpdateGuestRequestDto } from './guest-requests.dto';

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class GuestRequestsController implements Controller {

    path = `/${REQUESTS_PATH}`;
    router = express.Router();
    private _guestRequestsService = new GuestRequestsService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.path}*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))
        this.router.post(`${this.path}`, validate(CreateGuestRequestDto), this.addGuestRequest);
        this.router.get(`${this.path}`, this.getGuestRequests);
        this.router.get(`${this.path}/:requestId`, this.getGuestRequest);
        this.router.delete(`${this.path}/:requestId`, this.deleteGuestRequest);
        this.router.patch(`${this.path}/:requestId/approve`, this.approveGuestRequest);
        this.router.patch(`${this.path}/:requestId`, validate(UpdateGuestRequestDto), this.updateGuestRequest);
    }

    public addGuestRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const guestRequestPayload: IGuestRequestAddPayload = req.body;
            const guestRequest = await this._guestRequestsService.addGuestRequest(guestRequestPayload);
            res.status(StatusCodes.CREATED).json(guestRequest).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at addGuestRequest action ${error}`);
            if (error?.original?.code === INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('guestId, serviceId or categoryId'));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateGuestRequest = async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params;
        if (!requestId) {
            return next(new ParamRequiredException('requestId'));
        }
        try {
            const guestRequestPayload: IGuestRequestUpdatePayload = {
                ...req.body,
                requestId
            }
            const guestRequest = await this._guestRequestsService.updateGuestRequest(guestRequestPayload);
            res.status(StatusCodes.OK).json(guestRequest).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at updateGuestRequest action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('guestId or requestId'));
            }
            if (error instanceof NotFoundException || error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getGuestRequests = async (req: Request, res: Response, next: NextFunction) => {
        const { guestId } = req.query as { guestId: string };
        if (!guestId) {
            return next(new ParamRequiredException('guestId'));
        }
        try {
            const guestRequests = await this._guestRequestsService.getGuestRequests(guestId);
            res.status(StatusCodes.OK).json(guestRequests).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getGuestRequests action ${error}`);
            if (error instanceof NotFoundException) {
                return next(new NotFoundException('Guest', 'guestId', guestId));
            }
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('guestId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public deleteGuestRequest = async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params;
        if (!requestId) {
            return next(new ParamRequiredException('requestId'));
        }
        try {
            await this._guestRequestsService.deleteGuestRequest(requestId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at deleteGuestRequest action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('requestId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public approveGuestRequest = async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params;
        if (!requestId) {
            next(new ParamRequiredException('requestId'));
        }
        try {
            await this._guestRequestsService.approveGuestRequest(requestId); //not interested in the response
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at approveGuestRequest action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('guestId or requestId'));
            }
            if (error instanceof NotFoundException) {
                next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getGuestRequest = async (req: Request, res: Response, next: NextFunction) => {
        const { requestId } = req.params;
        if (!requestId) {
            return next(new ParamRequiredException('requestId'));
        }
        try {
            const guestRequest = await this._guestRequestsService.getGuestRequest(requestId);
            res.status(StatusCodes.OK).json(guestRequest).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getGuestRequest action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('requestId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
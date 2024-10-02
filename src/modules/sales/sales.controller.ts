import { INVALID_UUID, SALES_PATH } from "../../shared/constants";
import { Controller } from "../../shared/interfaces";
import logger from "../../config/logger";
import { accessTokenGuard, isOwnerOfProfileGuard, requireAnyOfThoseRoles, validate } from "../../shared/middlewares";
import { InternalServerException, InvalidEnumValueException, InvalidIdException, ParamRequiredException } from "../../shared/exceptions";
import { RoleEnum, SalesStageEnum } from "../../shared/enums";
import { ISalesGetPayload, ISaleUpdatePayload } from "./sales.interface";
import SalesService from "./sales.service";
import { UpdateSaleSchema } from "./sales.dto";

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";

export default class SalesController implements Controller {
    path = SALES_PATH;
    router = express.Router();
    private _salesService = new SalesService();

    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.path}*`, accessTokenGuard); // protect all routes
        this.router.get(`${this.path}/all`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.getAllSalesGrouped); //get all sales grouped by profileId

        // user routes
        // order is importenetm I'm validating profileId of the body before checking if it's owner of the profile
        this.router.get(this.path, isOwnerOfProfileGuard, this.getSales); //filter by profileId & status [there is pagination]
        this.router.patch(`${this.path}/:saleId`, validate(UpdateSaleSchema), isOwnerOfProfileGuard, this.updateSale); //update sale status
    }
    public getSales = async (req: Request, res: Response, next: NextFunction) => {
        const { profileId } = req.query;
        if (!profileId) {
            return next(new ParamRequiredException('Sale-made', 'profileId'));
        }
        const { stage, limit, offset } = req.query;
        if (stage && !Object.values(SalesStageEnum).includes(stage as SalesStageEnum)) {
            return next(new InvalidEnumValueException('SaleStage'));
        }

        try {
            const payload: ISalesGetPayload = {
                profileId: profileId as string,
                stage: stage as SalesStageEnum,
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined
            };
            const sales = await this._salesService.getSales(payload);
            res.status(StatusCodes.OK).json(sales).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at getSales action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('profileId'));
            }
            next(new InternalServerException(error.message));
        }
    };

    public updateSale = async (req: Request, res: Response, next: NextFunction) => {
        const { saleId } = req.params;
        if (!saleId) return next(new ParamRequiredException('Sale-made', 'saleId'));
        try {
            const saleUpdatePayload: ISaleUpdatePayload = {
                ...req.body, //status
                saleId
            }
            await this._salesService.updateSale(saleUpdatePayload);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateSale action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('saleId'));
            }
            next(new InternalServerException(error.message));
        }
    };

    public getAllSalesGrouped = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sales = await this._salesService.getAllSalesGrouped();
            res.status(StatusCodes.OK).json(sales).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getAllSalesGrouped action ${error}`);
            next(new InternalServerException(error.message));
        }
    };
}
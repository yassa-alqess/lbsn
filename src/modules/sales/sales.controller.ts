import { INVALID_UUID, PROFILES_PATH, SALES_PATH } from "../../shared/constants";
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
    profilesPath = `/${PROFILES_PATH}`;
    router = express.Router();
    private _salesService = new SalesService();

    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`/${this.path}/all`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.getAllSalesGrouped); //get all sales grouped by profileId

        // user routes
        this.router.all(`${this.profilesPath}/:profileId/${this.path}*`, accessTokenGuard, isOwnerOfProfileGuard); // protect all routes
        this.router.get(`${this.profilesPath}/:profileId/${this.path}`, this.getSales); //filter by profileId & status [there is pagination]
        this.router.patch(`${this.profilesPath}/:profileId/${this.path}/:saleId`, validate(UpdateSaleSchema), this.updateSale); //update sale status
    }
    public getSales = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            if (!profileId) {
                throw new ParamRequiredException('profileId');
            }
            const { stage, limit = 10, page = 1 } = req.query;
            if (stage && !Object.values(SalesStageEnum).includes(stage as SalesStageEnum)) {
                throw new InvalidEnumValueException('SaleStage');
            }
            const payload: ISalesGetPayload = {
                profileId: profileId as string,
                stage: stage as SalesStageEnum,
                limit: parseInt(limit as string),
                offset: (parseInt(page as string) - 1) * parseInt(limit as string)
            };
            const sales = await this._salesService.getSales(payload);
            res.status(StatusCodes.OK).json(sales).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at getSales action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('profileId'));
            }
            if (error instanceof ParamRequiredException || error instanceof InvalidEnumValueException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public updateSale = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { saleId } = req.params;
            if (!saleId) throw new ParamRequiredException('saleId');

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
            if (error instanceof ParamRequiredException) {
                return next(error);
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
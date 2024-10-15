import { OVERVIEW_PATH } from "../../shared/constants";
import { Controller } from "../../shared/interfaces";
import { PeriodDto } from "./overview.dto";
import { accessTokenGuard, isOwnerOfProfileGuard, validate } from "../../shared/middlewares";
import logger from "../../config/logger";
import OverviewService from "./overview.service";
import { InternalServerException } from "../../shared/exceptions";
import { IPeriod } from "./overview.interface";
import { PROFILES_PATH } from "../../shared/constants";

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";

export default class OverviewController implements Controller {

    path = `${OVERVIEW_PATH}`;
    profilesPath = `/${PROFILES_PATH}`;
    router = express.Router();
    private _overviewService = new OverviewService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.profilesPath}/:profileId/${this.path}*`, accessTokenGuard, isOwnerOfProfileGuard); // protect all routes
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/leads-per-period`, validate(PeriodDto), this.getLeadsPerPeriod);
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/deals-per-period`, validate(PeriodDto), this.getDealsPerPeriod);
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/deals-count`, validate(PeriodDto), this.getDealsCount);
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/deals-value-sum`, validate(PeriodDto), this.getDealsValueSum);
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/conversion-rate`, validate(PeriodDto), this.getConversionRate);
    }

    public getLeadsPerPeriod = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const leads = await this._overviewService.getLeadsCountByPeriod(periodPayload);
            res.status(StatusCodes.OK).json({ leads }).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(error.message);
            next(new InternalServerException("Failed to get leads per period"));
        }
    }

    public getDealsPerPeriod = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const deals = await this._overviewService.getDealsCountByPeriod(periodPayload);
            res.status(StatusCodes.OK).json({ deals }).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(error.message);
            next(new InternalServerException("Failed to get deals per period"));
        }
    }

    public getDealsCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const deals = await this._overviewService.getDealsCount(periodPayload);
            res.status(StatusCodes.OK).json({ deals }).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(error.message);
            next(new InternalServerException("Failed to get deals count"));
        }
    }

    public getDealsValueSum = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const dealsValue = await this._overviewService.getDealsValueSum(periodPayload);
            res.status(StatusCodes.OK).json({ dealsValue }).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(error.message);
            next(new InternalServerException("Failed to get deals value Sum"));
        }
    }

    public getConversionRate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const rate = await this._overviewService.getConversionRate(periodPayload);
            res.status(StatusCodes.OK).json({ rate }).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(error.message);
            next(new InternalServerException("Failed to get deals count"));
        }
    }
}

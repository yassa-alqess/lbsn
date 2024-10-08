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
        this.router.all(`${this.path}*`, accessTokenGuard, isOwnerOfProfileGuard); // protect all routes
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/leads-per-period`, validate(PeriodDto), this.getLeadsPerPeriod);
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/deals-per-period`, validate(PeriodDto), this.getDealsPerPeriod);
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/deals-count`, validate(PeriodDto), this.getDealsCount);
        this.router.post(`${this.profilesPath}/:profileId/${this.path}/deals-value-count`, validate(PeriodDto), this.getDealsValueCount);
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
        } catch (error) {
            logger.error(error);
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
        } catch (error) {
            logger.error(error);
            next(new InternalServerException("Failed to get deals per period"));
        }
    }

    public getDealsCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const periodPayload: IPeriod = {
                ...req.body,
            }
            const deals = await this._overviewService.getDealsCount(periodPayload);
            res.status(StatusCodes.OK).json({ deals }).end();
        } catch (error) {
            logger.error(error);
            next(new InternalServerException("Failed to get deals count"));
        }
    }

    public getDealsValueCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const periodPayload: IPeriod = {
                ...req.body,
            }
            const dealsValue = await this._overviewService.getDealsValueSum(periodPayload);
            res.status(StatusCodes.OK).json({ dealsValue }).end();
        } catch (error) {
            logger.error(error);
            next(new InternalServerException("Failed to get deals value count"));
        }
    }
}

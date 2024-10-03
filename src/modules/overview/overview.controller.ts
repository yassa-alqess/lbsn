import { OVERVIEW_PATH } from "../../shared/constants";
import { Controller } from "../../shared/interfaces";
import { PeriodDto } from "./overview.dto";
import { accessTokenGuard, isOwnerOfProfileGuard, validate } from "../../shared/middlewares";
import logger from "../../config/logger";
import OverviewService from "./overview.service";
import { InternalServerException, ParamRequiredException } from "../../shared/exceptions";
import { IPeriod } from "./overview.interface";

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";

export default class OverviewController implements Controller {

    path = OVERVIEW_PATH;
    router = express.Router();
    private _overviewService = new OverviewService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        //order is importenetm I'm validating profileId of the body before checking if it's owner of the profile
        this.router.all(`${this.path}*`, accessTokenGuard); // protect all routes
        this.router.post(`${this.path}/leads-per-period`, validate(PeriodDto), isOwnerOfProfileGuard, this.getLeadsPerPeriod);
        this.router.post(`${this.path}/leads-count`, validate(PeriodDto), isOwnerOfProfileGuard, this.getDealsCount);
        this.router.post(`${this.path}/deals-value-count`, validate(PeriodDto), isOwnerOfProfileGuard, this.getDealsValueCount);
        // this.router.post(`${this.path}/deals-per-leads`, validate(PeriodDto), this.getDealsPerLeads);
        // this.router.post(`${this.path}/conversion-rate`, validate(PeriodDto), this.getConversionRate);
    }

    public getLeadsPerPeriod = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.query as { profileId: string };
            if (!profileId) {
                throw new ParamRequiredException('Profile', 'profileId');
            }
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const leads = await this._overviewService.getLeadCountByPeriod(periodPayload);
            res.status(StatusCodes.OK).json({ leads }).end();
        } catch (error) {
            logger.error(error);
            if (error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException("Failed to get leads per period"));
        }
    }

    public getDealsCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.query as { profileId: string };
            if (!profileId) {
                throw new ParamRequiredException('Profile', 'profileId');
            }
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const deals = await this._overviewService.getDealsCount(periodPayload);
            res.status(StatusCodes.OK).json({ deals }).end();
        } catch (error) {
            logger.error(error);
            if (error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException("Failed to get deals count"));
        }
    }

    public getDealsValueCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.query as { profileId: string };
            if (!profileId) {
                throw new ParamRequiredException('Profile', 'profileId');
            }
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const dealsValue = await this._overviewService.getDealsValueCount(periodPayload);
            res.status(StatusCodes.OK).json({ dealsValue }).end();
        } catch (error) {
            logger.error(error);
            if (error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException("Failed to get deals value count"));
        }
    }
}

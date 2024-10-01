import { OVERVIEW_PATH } from "../../shared/constants";
import { Controller } from "../../shared/interfaces";
import { PeriodDto } from "./overview.dto";
import { accessTokenGuard, validate } from "../../shared/middlewares";
import logger from "../../config/logger";
import OverviewService from "./overview.service";
import { InternalServerException } from "../../shared/exceptions";
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
        this.router.all(`${this.path}*`, accessTokenGuard);
        this.router.post(`${this.path}/leads-per-period`, validate(PeriodDto), this.getLeadsPerPeriod);
        // this.router.post(`${this.path}/deals-per-leads`, validate(PeriodDto), this.getDealsPerLeads);
        // this.router.post(`${this.path}/leads-count`, validate(PeriodDto), this.getLeadsCount);
        // this.router.post(`${this.path}/deals-value-count`, validate(PeriodDto), this.getDealsValueCount);
        // this.router.post(`${this.path}/conversion-rate`, validate(PeriodDto), this.getConversionRate);
    }

    private getLeadsPerPeriod = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const periodPayload: IPeriod = req.body;
            const leads = await this._overviewService.getLeadCountByPeriod(periodPayload);
            res.status(StatusCodes.OK).json({ leads }).end();
        } catch (error) {
            logger.error(error);
            next(new InternalServerException("Failed to get leads per period"));
        }
    }
}

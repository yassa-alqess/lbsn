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
        this.router.post(`${this.profilesPath}/:profileId/${this.path}`, accessTokenGuard, isOwnerOfProfileGuard, validate(PeriodDto), this.getGraphData);
    }

    public getGraphData = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            const periodPayload: IPeriod = {
                ...req.body,
                profileId
            }
            const data = await this._overviewService.getGraphData(periodPayload);
            res.status(StatusCodes.OK).json(data).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(error.message);
            next(new InternalServerException("Failed to get graph data"));
        }
    }
}

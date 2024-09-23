import WarmLeadsService from './warm-leads.service'; // Adjust the import according to your project structure
import { IWarmLeadAddPayload } from './warm-leads.interface'; // Adjust the import according to your project structure
import { accessTokenGuard, requireAnyOfThoseRoles } from '../../shared/middlewares';
import { RoleEnum } from '../../shared/enums';
import { Controller } from '../../shared/interfaces';
import { WARM_LEADS_PATH } from '../../shared/constants';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class WarmLeadsController implements Controller {
    private _warmLeadsService = new WarmLeadsService();
    router = express.Router();
    path = WARM_LEADS_PATH;

    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.post(`${this.path}`, this.addWarmLead);
        this.router.get(
            `${this.path}`,
            accessTokenGuard,
            requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]),
            this.getAllWarmLeads
        );
    }

    public addWarmLead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload: IWarmLeadAddPayload = req.body;
            const newWarmLead = await this._warmLeadsService?.addWarmLead(payload);
            res.status(StatusCodes.CREATED).json(newWarmLead);

            //eslint-disable-next-line
        } catch (error: any) {
            next(error);
        }
    }

    public getAllWarmLeads = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const warmLeads = await this._warmLeadsService?.getAllWarmLeads();
            res.status(StatusCodes.OK).json(warmLeads);

            //eslint-disable-next-line
        } catch (error: any) {
            next(error);
        }
    }
}
import { INVALID_UUID, LEADS_PATH, PROFILES_PATH } from "../../shared/constants";
import { Controller } from "../../shared/interfaces";
import logger from "../../config/logger";
import { accessTokenGuard, isOwnerOfProfileGuard, requireAnyOfThoseRoles, validate } from "../../shared/middlewares";
import { InternalServerException, InvalidEnumValueException, InvalidIdException, ParamRequiredException } from "../../shared/exceptions";
import { LeadStatusEnum, RoleEnum } from "../../shared/enums";
import { ILeadsGetPayload, ILeadUpdatePayload } from "./leads.interface";
import LeadsService from "./leads.service";
import { UpdateLeadSchema } from "./leads.dto";

// 3rd party dependencies
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";

export default class LeadsController implements Controller {
    path = LEADS_PATH;
    profilesPath = `/${PROFILES_PATH}`;
    router = express.Router();
    private _leadsService = new LeadsService();

    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`/${this.path}/all`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.getAllLeadsGrouped); //get all leads grouped by profileId

        // user routes
        this.router.all(`${this.profilesPath}/:profileId/${this.path}*`, accessTokenGuard, isOwnerOfProfileGuard); // protect all routes
        this.router.get(`${this.profilesPath}/:profileId/${this.path}`, this.getLeads); //filter by profileId & status [there is pagination]
        this.router.patch(`${this.profilesPath}/:profileId/${this.path}/:leadId`, validate(UpdateLeadSchema), isOwnerOfProfileGuard, this.updateLead); //update lead status
    }

    public getLeads = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { profileId } = req.params;
            if (!profileId) {
                throw new ParamRequiredException('profileId');
            }

            const { status, otherType, limit, offset } = req.query;
            if (status && !Object.values(LeadStatusEnum).includes(status as LeadStatusEnum)) {
                throw new InvalidEnumValueException('LeadStatus');
            }

            const payload: ILeadsGetPayload = {
                profileId: profileId as string,
                status: status as LeadStatusEnum,
                otherType: otherType as string || undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined
            };
            const leads = await this._leadsService.getLeads(payload);
            res.status(StatusCodes.OK).json(leads).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('error at getLeads action', error);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('profileId'));
            }
            if (error instanceof ParamRequiredException || error instanceof InvalidEnumValueException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public updateLead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { leadId } = req.params;
            if (!leadId) throw new ParamRequiredException('leadId');

            const leadUpdatePayload: ILeadUpdatePayload = {
                ...req.body, //status & otherType
                leadId
            }
            await this._leadsService.updateLead(leadUpdatePayload);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateLead action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('leadId'));
            }
            if (error instanceof ParamRequiredException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    };

    public getAllLeadsGrouped = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const leads = await this._leadsService.getAllLeadsGrouped();
            res.status(StatusCodes.OK).json(leads).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at getAllLeadsGrouped action ${error}`);
            next(new InternalServerException(error.message));
        }
    };
}
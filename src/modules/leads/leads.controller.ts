import { ACCESS_TOKEN_SECRET, INVALID_UUID, LEAD_FETCH_INTERVAL, LEADS_PATH } from "../../shared/constants";
import { Controller, ExtendedWebSocketServer } from "../../shared/interfaces";
import logger from "../../config/logger";
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from "../../shared/middlewares";
import { InternalServerException, InvalidEnumValueException, InvalidIdException, ParamRequiredException } from "../../shared/exceptions";
import { LeadStatusEnum, RoleEnum } from "../../shared/enums";
import { ILeadsGetPayload, ILeadUpdatePayload } from "./leads.interface";
import LeadsService from "./leads.service";
import { UpdateLeadSchema } from "./leads.dto";
import { WSS_SERVER } from "../../startup";

// 3rd party dependencies
import WebSocket from "ws";
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import jwt from 'jsonwebtoken';
import ms from "ms";

export default class LeadsController implements Controller {
    path = LEADS_PATH;
    router = express.Router();
    private _wss: ExtendedWebSocketServer | null = null;
    private _leadsService = new LeadsService();

    constructor() {
        this._wss = WSS_SERVER;
        this._initializeRoutes();
        this._bindWebSocket();
    }

    private _initializeRoutes() {
        this.router.all(`${this.path}*`, accessTokenGuard);
        this.router.get(this.path, this.getLeads); //filter by profileId & status [there is pagination]
        this.router.get(`${this.path}/all`, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]), this.getAllLeadsGrouped); //get all leads grouped by profileId
        this.router.patch(`${this.path}/:leadId`, validate(UpdateLeadSchema), this.updateLead); //update lead status
    }

    private _bindWebSocket() {
        this._wss!.on('connection', (ws: WebSocket) => {
            logger.info('WebSocket client connected');

            ws.on('message', async (message: string) => {
                try {
                    const { profileId, accessToken } = JSON.parse(message);

                    // Validate accessToken (replace 'your-secret-key' with your JWT secret)
                    //eslint-disable-next-line
                    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (err: any) => {
                        if (err) {
                            logger.error('Invalid access token');
                            ws.close(1008, 'Invalid access token'); // 1008: Policy Violation
                            return;
                        }

                        logger.info(`Authenticated client with profileId: ${profileId}`);

                        try {
                            // Fetch and send data based on profileId
                            const data = await this._leadsService.getSheetLeads(profileId);
                            ws.send(JSON.stringify(data));
                            //eslint-disable-next-line
                        } catch (error: any) {
                            logger.error(`Error fetching leads data: ${error.message}`);
                            ws.close(1008, `Error fetching leads data`); // 1008: Policy Violation
                            return;
                        }

                        // Start sending data at regular intervals
                        const intervalId = setInterval(async () => {
                            try {
                                // Fetch and send data based on profileId
                                const data = await this._leadsService.getSheetLeads(profileId);
                                ws.send(JSON.stringify(data));
                                //eslint-disable-next-line
                            } catch (error: any) {
                                logger.error(`Error fetching leads data: ${error.message}`);
                                ws.close(1008, `Error fetching leads data`); // 1008: Policy Violation
                                clearInterval(intervalId);

                            }
                        }, ms(LEAD_FETCH_INTERVAL)); // Send data every interval

                        // Handle client disconnection
                        ws.on('close', () => {
                            logger.info('WebSocket client disconnected');
                            clearInterval(intervalId);
                        });

                        ws.on('error', (error) => {
                            logger.error(`WebSocket error: ${error.message}`);
                            clearInterval(intervalId);
                        });
                    });
                    //eslint-disable-next-line
                } catch (error: any) {
                    logger.error(`Error handling WebSocket message:, ${error.message}`);
                    ws.close(1003, 'Invalid message format'); // 1003: Unsupported Data
                }
            });
        });
    }

    public getLeads = async (req: Request, res: Response, next: NextFunction) => {
        const { profileId } = req.query;
        if (!profileId) {
            return next(new ParamRequiredException('Leads', 'profileId'));
        }
        const { status, otherType, limit, offset } = req.query;
        if (status && !Object.values(LeadStatusEnum).includes(status as LeadStatusEnum)) {
            return next(new InvalidEnumValueException('LeadStatus'));
        }

        try {
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
            next(new InternalServerException(error.message));
        }
    };

    public updateLead = async (req: Request, res: Response, next: NextFunction) => {
        const { leadId } = req.params;
        if (!leadId) return next(new ParamRequiredException('Lead', 'leadId'));
        try {
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
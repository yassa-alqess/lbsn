import Service from "../../shared/models/service";
import GuestRequest from "../../shared/models/guest-request";
import GuestService from "../guests/guests.service";
import UserProfilesService from "../user-profiles/user-profiles.service";
import logger from "../../config/logger";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IsResolvedEnum, MarketingBudgetEnum } from "../../shared/enums";
import { IgetGuestRequestsResponse, IGuestRequest, IGuestRequestAddPayload, IGuestRequestUpdatePayload } from "./guest-requests.interface";
import { ApproveGuestResponse } from "../guests/guests.interface";
import EmailService from "../../config/mailer";
import { IEmailOptions } from "../../config/mailer/email.interface";
import DatabaseManager from "../../config/database/db-manager";
import { IProfileAddPayload } from "../user-profiles/user-profiles.interface";
import SheetsService from "../sheets/sheets.service";

// 3rd party dependencies
import { Sequelize, Transaction } from "sequelize";

export default class GuestRequestsService {
    private _guestService = new GuestService();
    private _userProfilesService = new UserProfilesService();
    private _emailService = new EmailService();
    private _sequelize: Sequelize | null = null;
    private _sheetsService = new SheetsService();
    constructor() {

        this._sequelize = DatabaseManager.getSQLInstance();
    }
    public async addGuestRequest(guestRequestPayload: IGuestRequestAddPayload): Promise<IGuestRequest> {
        logger.debug(`Adding Guest Request for ${guestRequestPayload.guestId} and service ${guestRequestPayload.requestId}`);
        const { guestId, requestId, marketingBudget } = guestRequestPayload;

        try {
            const guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId: requestId } });
            if (guestRequest) {
                throw new Error(`Guest request already exists`);
            }

            // Check if the service exists
            const service = await Service.findOne({ where: { serviceId: requestId } });
            if (!service) {
                throw new NotFoundException("Service", "serviceId", requestId);
            }
            const newGuestRequest = await GuestRequest.create({
                guestId, serviceId: requestId, resolved: IsResolvedEnum.PENDING, marketingBudget
            });

            // Fetch the newly created guest request with the associated service
            const guestRequestWithService = await GuestRequest.findOne({
                where: { guestRequestId: newGuestRequest.guestRequestId },
                include: [{ model: Service, as: 'service' }] // Include the service data
            });

            if (!guestRequestWithService || !guestRequestWithService.service) {
                throw new Error("Service not found for the created guest request");
            }

            return {
                // ...guestRequestWithService.toJSON() as IGuestRequest,
                guestRequestId: guestRequestWithService.guestRequestId,
                guestId: guestRequestWithService.guestId,
                requestId: guestRequestWithService.serviceId,
                name: guestRequestWithService.service.name,
                status: guestRequestWithService.resolved as IsResolvedEnum,
                marketingBudget: guestRequestWithService.marketingBudget as MarketingBudgetEnum

            }
        }
        //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error adding guest request: ${error.message}`);
            throw new Error(`Error adding guest request: ${error.message}`);
        }
    }

    public async updateGuestRequest(guestRequestPayload: IGuestRequestUpdatePayload): Promise<IGuestRequest | undefined> {
        const { guestId, requestId, marketingBudget } = guestRequestPayload;
        try {
            let guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId: requestId } });
            if (!guestRequest) {
                throw new Error('Guest Request not found');
            }
            guestRequest = await guestRequest.update({ marketingBudget });

            // Fetch the newly created guest request with the associated service
            const guestRequestWithService = await GuestRequest.findOne({
                where: { guestRequestId: guestRequest.guestRequestId },
                include: [{ model: Service, as: 'service' }] // Include the service data
            });

            if (!guestRequestWithService || !guestRequestWithService.service) {
                throw new Error("Service not found for the created guest request");
            }

            return {
                // ...guestRequestWithService.toJSON() as IGuestRequest,
                guestRequestId: guestRequestWithService.guestRequestId,
                guestId: guestRequestWithService.guestId,
                requestId: guestRequestWithService.serviceId,
                name: guestRequestWithService.service.name,
                status: guestRequestWithService.resolved as IsResolvedEnum,
                marketingBudget: guestRequestWithService.marketingBudget as MarketingBudgetEnum
            }
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating guest request: ${error.message}`);
            throw new Error(`Error updating guest request: ${error.message}`);
        }
    }

    public async getGuestRequests(guestId: string): Promise<IgetGuestRequestsResponse | undefined> {
        const guestRequests = await GuestRequest.findAll({
            where: { guestId },
            include: [{
                model: Service,
                attributes: ['serviceId', 'name'],
            }],
        });

        const guestRequestsResponse: IGuestRequest[] = guestRequests.map(request => ({
            // ...request.toJSON() as IGuestRequest,
            guestRequestId: request.guestRequestId,
            guestId: request.guestId,
            requestId: request.serviceId,
            name: request.service.name,
            status: request.resolved as IsResolvedEnum,
            marketingBudget: request.marketingBudget as MarketingBudgetEnum
        }));

        return { gestRequests: guestRequestsResponse };
    }

    public async deleteGuestRequest(guestId: string, requestId: string, txn?: Transaction | null): Promise<void> {
        const transaction = txn || await this._sequelize!.transaction();

        try {
            // Find the specific guest request
            const guestRequest = await GuestRequest.findOne({
                where: { guestId, serviceId: requestId },
                transaction,
            });

            if (!guestRequest) {
                throw new Error(`Guest request not found`);
            }

            // Delete the guest request
            await guestRequest.destroy({ transaction });

            // Check if there are any remaining requests for this guest
            const remainingRequests = await GuestRequest.count({ where: { guestId }, transaction });

            // If no requests remain, delete the guest
            if (remainingRequests === 0) {
                await this._guestService.deleteGuest(guestId, transaction);
            }

            // Commit the transaction if it was created within this method
            if (!txn) {
                await transaction.commit();
            }
            //eslint-disable-next-line
        } catch (error: any) {
            // Rollback the transaction if it was created within this method
            if (!txn) {
                await transaction.rollback();
            }
            logger.error(`Error deleting guest request: ${error.message}`);
            throw new Error(`Error deleting guest request: ${error.message}`);
        }
    }

    public async deleteAllGuestRequests(guestId: string, txn?: Transaction | null): Promise<void> {
        const transaction = txn || await this._sequelize!.transaction();

        try {
            // Find all guest requests for the given guest
            const guestRequests = await GuestRequest.findAll({ where: { guestId }, transaction });

            // Delete all guest requests
            await Promise.all(guestRequests.map(async request => {
                await request.destroy({ transaction });
            }));

            // Commit the transaction if it was created within this method
            if (!txn) {
                await transaction.commit();
            }
            //eslint-disable-next-line
        } catch (error: any) {
            // Rollback the transaction if it was created within this method
            if (!txn) {
                await transaction.rollback();
            }
            logger.error(`Error deleting all guest requests: ${error.message}`);
            throw new Error(`Error deleting all guest requests: ${error.message}`);
        }
    }

    public async getGuestRequest(guestId: string, requestId: string): Promise<IGuestRequest | undefined> {
        const guestRequest = await GuestRequest.findOne({
            where: { guestId, serviceId: requestId },
            include: [{
                model: Service,
                attributes: ['serviceId', 'name'],
            }],
        });
        if (!guestRequest) {
            throw new Error(`Guest request not found`);
        }
        return {
            // ...guestRequest.toJSON() as IGuestRequest,
            guestRequestId: guestRequest.guestRequestId,
            guestId: guestRequest.guestId,
            requestId: guestRequest.serviceId,
            name: guestRequest.service.name,
            status: guestRequest.resolved as IsResolvedEnum,
            marketingBudget: guestRequest.marketingBudget as MarketingBudgetEnum
        }
    }

    public async approveGuestRequest(guestId: string, requestId: string, txn?: Transaction): Promise<void> {
        const transaction = txn || await this._sequelize!.transaction();

        try {
            const guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId: requestId }, transaction });
            if (!guestRequest) {
                throw new Error('Guest Request not found');
            }

            // Update guest-service status
            await guestRequest.update({ resolved: IsResolvedEnum.RESOLVED }, { transaction });

            // Approve guest and return necessary data for email
            let approvalResult: ApproveGuestResponse | null = null;
            try {
                approvalResult = await this._guestService.approveGuest(guestId, transaction);
                //eslint-disable-next-line
            } catch (err: any) {
                if (err instanceof NotFoundException) {
                    throw new Error(err.message);
                } else if (err instanceof AlreadyExistsException) {
                    logger.info(err.message);
                } else {
                    logger.error(`Couldn't approve the guest: ${err.message}`);
                    throw new Error(`Couldn't approve the guest`);
                }
            }

            // Fetch request data
            const requestData = await Service.findOne({ where: { serviceId: requestId }, transaction });
            if (!requestData) {
                throw new NotFoundException("Service", "serviceId", requestId);
            }

            //create new sheet & add the user to the sheet as editor
            let sheetUrl: string = '';
            try {

                const sheet = await this._sheetsService.createSpreadSheet(`${approvalResult?.userId}-${requestData.name}-${Date.now()}`, requestData.name);
                sheetUrl = sheet.spreadsheetId;
                await this._sheetsService.shareSheetWithEmail(sheetUrl, approvalResult?.email as string);

            } //eslint-disable-next-line
            catch (error: any) {
                logger.error(`Error creating sheet: ${error.message}`);
                throw new Error(`Error creating sheet`);
            }

            // Create profile & add service/request data to profile
            try {
                const profilePayload: IProfileAddPayload = {
                    userId: approvalResult?.userId as string,
                    name: requestData.name,
                    marketingBudget: guestRequest.marketingBudget as MarketingBudgetEnum,
                    sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetUrl}`,
                    sheetName: requestData.name,
                }
                await this._userProfilesService.addUserProfile(profilePayload, transaction);
                //eslint-disable-next-line
            } catch (err: any) {
                if (err instanceof AlreadyExistsException) {
                    logger.info(err.message);
                } else {
                    logger.error(`Couldn't create a profile: ${err.message}`);
                    throw new Error(`Couldn't create a profile`);
                }
            }

            await transaction.commit(); // Commit the transaction

            // Send the email after committing the transaction
            if (approvalResult?.sendEmail == true) {
                await this._emailService.sendEmail(approvalResult?.emailPayload as IEmailOptions);
            }

            // eslint-disable-next-line
        } catch (error: any) {
            if (!txn) {
                await transaction.rollback(); // Rollback the transaction only if it wasn't provided
            }
            logger.error(`Error approving guest request: ${error.message}`);
            throw new Error(`Error approving guest request: ${error.message}`);
        }
    }
}
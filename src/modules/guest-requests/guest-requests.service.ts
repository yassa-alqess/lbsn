import Service from "../../shared/models/service";
import GuestRequest from "../../shared/models/guest-request";
import GuestService from "../guests/guests.service";
import Category from "../../shared/models/category";
import Appointment from "../../shared/models/appointment";
import ServiceCategory from "../../shared/models/service-category";
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
import HttpException from "../../shared/exceptions/http.exception";

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
        const { guestId, serviceId, categoryId, marketingBudget, isUser } = guestRequestPayload;

        try {
            const guestRequest = await GuestRequest.findOne({ where: { guestId, serviceId } });
            if (guestRequest) {
                throw new HttpException(400, "Guest request already exists");
            }

            // Check if the service exists
            //aslo check if there is a category
            // also check if this servicce is in the category
            const service = await Service.findOne({ where: { serviceId } });
            if (!service) {
                throw new NotFoundException("Service", "serviceId", serviceId);
            }

            const category = await Category.findOne({ where: { categoryId } });
            if (!category) {
                throw new NotFoundException("Category", "categoryId", categoryId);
            }

            const serviceCategory = await ServiceCategory.findOne({ where: { serviceId, categoryId } });
            if (!serviceCategory) {
                throw new HttpException(400, "Service is not in the category");
            }

            const newGuestRequest = await GuestRequest.create({
                guestId, serviceId, categoryId, resolved: IsResolvedEnum.PENDING, marketingBudget, isUser
            });

            return {
                requestId: newGuestRequest.guestRequestId,
                guestId: newGuestRequest.guestId,
                serviceId: newGuestRequest.serviceId,
                categoryId: category.categoryId,
                status: newGuestRequest.resolved as IsResolvedEnum,
                marketingBudget: newGuestRequest.marketingBudget as MarketingBudgetEnum
            }
        }
        //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error adding guest request: ${error.message}`);
            throw new Error(`Error adding guest request: ${error.message}`);
        }
    }

    public async updateGuestRequest(guestRequestPayload: IGuestRequestUpdatePayload): Promise<IGuestRequest | undefined> {
        const { requestId, marketingBudget, serviceId, categoryId, status } = guestRequestPayload;
        try {
            const guestRequest = await GuestRequest.findOne({ where: { guestRequestId: requestId } });
            if (!guestRequest) {
                throw new NotFoundException("Guest Request", "requestId", requestId);
            }
            if (serviceId && categoryId) {
                const service = await Service.findOne({ where: { serviceId } });
                if (!service) {
                    throw new NotFoundException("Service", "serviceId", serviceId);
                }

                const category = await Category.findOne({ where: { categoryId } });
                if (!category) {
                    throw new NotFoundException("Category", "categoryId", categoryId);
                }

                const serviceCategory = await ServiceCategory.findOne({ where: { serviceId, categoryId } });
                if (!serviceCategory) {
                    throw new HttpException(400, "Service is not in the category");
                }
                guestRequest.serviceId = serviceId;
                guestRequest.categoryId = categoryId;
            }
            const newGuestRequest = await guestRequest.update({ marketingBudget, resolved: status });

            return {
                requestId: newGuestRequest.guestRequestId,
                guestId: newGuestRequest.guestId,
                serviceId: newGuestRequest.serviceId,
                categoryId: newGuestRequest.categoryId,
                status: newGuestRequest.resolved as IsResolvedEnum,
                marketingBudget: newGuestRequest.marketingBudget as MarketingBudgetEnum
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
        });

        const guestRequestsResponse: IGuestRequest[] = guestRequests.map(request => ({
            // ...request.toJSON() as IGuestRequest,
            requestId: request.guestRequestId,
            guestId: request.guestId,
            serviceId: request.serviceId,
            categoryId: request.categoryId,
            status: request.resolved as IsResolvedEnum,
            marketingBudget: request.marketingBudget as MarketingBudgetEnum
        }));

        return { gestRequests: guestRequestsResponse };
    }

    public async deleteGuestRequest(requestId: string, txn?: Transaction | null): Promise<void> {
        const transaction = txn || await this._sequelize!.transaction();

        try {
            // Find the specific guest request
            const guestRequest = await GuestRequest.findByPk(requestId, { transaction });
            if (!guestRequest) {
                throw new NotFoundException("Guest Request", "requestId", requestId);
            }

            // Delete the guest request
            await guestRequest.destroy({ transaction });

            // Check if there are any remaining requests for this guest
            const remainingRequests = await GuestRequest.count({ where: { guestId: guestRequest.guestId }, transaction });

            // If no requests remain, delete the guest
            if (remainingRequests === 0) {
                await this._guestService.deleteGuest(guestRequest.guestId, transaction);
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

    public async getGuestRequest(requestId: string): Promise<IGuestRequest | undefined> {
        const guestRequest = await GuestRequest.findByPk(requestId);
        if (!guestRequest) {
            throw new Error(`Guest request not found`);
        }
        return {
            // ...guestRequest.toJSON() as IGuestRequest,
            requestId: guestRequest.guestRequestId,
            guestId: guestRequest.guestId,
            serviceId: guestRequest.serviceId,
            categoryId: guestRequest.categoryId,
            status: guestRequest.resolved as IsResolvedEnum,
            marketingBudget: guestRequest.marketingBudget as MarketingBudgetEnum
        }
    }

    public async approveGuestRequest(requestId: string, txn?: Transaction): Promise<void> {
        const transaction = txn || await this._sequelize!.transaction();

        try {
            const guestRequest = await this._findGuestRequest(requestId, transaction);
            await this._updateGuestRequestStatus(guestRequest.requestId, transaction);
            await this._deleteAppointmentForApprovedRequest(guestRequest.requestId, transaction);
            logger.debug(`guestRequest: ${JSON.stringify(guestRequest)}`);
            const approvalResult = await this._approveGuest(guestRequest.guestId, transaction);

            const sheetUrl = await this._createAndShareSheet(approvalResult?.userId, guestRequest);
            await this._createProfile(approvalResult?.userId, guestRequest, sheetUrl, transaction);

            await transaction.commit(); // Commit the transaction

            if (approvalResult?.sendEmail) {
                await this._emailService.sendEmail(approvalResult?.emailPayload as IEmailOptions);
            }

            //eslint-disable-next-line
        } catch (error: any) {
            if (!txn) {
                await transaction.rollback(); // Rollback the transaction only if it wasn't provided
            }
            logger.error(`Error approving guest request: ${error.message}`);
            throw new Error(`Error approving guest request: ${error.message}`);
        }
    }

    private async _findGuestRequest(requestId: string, transaction: Transaction) {
        const guestRequest = await GuestRequest.findByPk(requestId, {
            include: [
                {
                    model: Service,
                    as: 'service',
                    attributes: ['name'],
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'],
                },
            ],
            transaction
        });
        if (!guestRequest) {
            throw new NotFoundException("Guest Request", "requestId", requestId);
        }
        return {
            requestId: guestRequest.guestRequestId,
            guestId: guestRequest.guestId,
            serviceId: guestRequest.serviceId,
            serviceName: guestRequest.service?.name,
            categoryId: guestRequest.categoryId,
            categoryName: guestRequest.category?.name,
            status: guestRequest.resolved as IsResolvedEnum,
            marketingBudget: guestRequest.marketingBudget as MarketingBudgetEnum
        }
    }

    private async _updateGuestRequestStatus(requestId: string, transaction: Transaction) {
        const guestRequest = await GuestRequest.findByPk(requestId, { transaction });
        if (!guestRequest) {
            throw new NotFoundException("Guest Request", "requestId", requestId);
        }
        await guestRequest.update({ resolved: IsResolvedEnum.RESOLVED }, { transaction });
    }

    private async _deleteAppointmentForApprovedRequest(requestId: string, transaction: Transaction) {
        try {
            // Find the appointment for the given request
            const appointment = await Appointment.findByPk(requestId, { transaction });
            if (!appointment) {
                throw new NotFoundException("Appointment", "requestId", requestId);
            }

            // Delete the appointment
            await appointment.destroy({ transaction });

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error deleting appointment for approved request: ${error.message}`);
            throw new Error(`Error deleting appointment for approved request: ${error.message}`);
        }
    }

    private async _approveGuest(guestId: string, transaction: Transaction): Promise<ApproveGuestResponse | null> {
        try {
            return await this._guestService.approveGuest(guestId, transaction);

            //eslint-disable-next-line
        } catch (err: any) {
            if (err instanceof NotFoundException) {
                throw new Error(err.message);
            } else if (err instanceof AlreadyExistsException) { //if user record of this guest already exists (guest already approved)
                logger.info(err.message);
                return null;
            } else {
                logger.error(`Couldn't approve the guest: ${err.message}`);
                throw new Error(`Couldn't approve the guest`);
            }
        }
    }

    private async _createAndShareSheet(userId: string | undefined, guestRequest: IGuestRequest): Promise<string> {
        let sheetUrl: string = '';
        try {
            const sheet = await this._sheetsService.createSpreadSheet(`${userId}-${guestRequest.categoryName}-${guestRequest.serviceName}-${Date.now()}`, guestRequest.serviceName);
            sheetUrl = sheet.spreadsheetId;
            await this._sheetsService.shareSheetWithEmail(sheetUrl, "iscoadms2@gmail.com"); // temporary for testing
            return `https://docs.google.com/spreadsheets/d/${sheetUrl}`;

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error creating sheet: ${error.message}`);
            throw new Error(`Error creating sheet`);
        }
    }

    private async _createProfile(userId: string | undefined, guestRequest: IGuestRequest, sheetUrl: string, transaction: Transaction) {
        try {
            const profilePayload: IProfileAddPayload = {
                userId: userId as string,
                marketingBudget: guestRequest.marketingBudget as MarketingBudgetEnum,
                sheetUrl: sheetUrl,
                sheetName: guestRequest.serviceName,
                serviceId: guestRequest.serviceId,
                categoryId: guestRequest.categoryId,
                requestId: guestRequest.requestId
            };
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
    }

}
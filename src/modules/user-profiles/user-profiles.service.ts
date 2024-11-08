import Profile from "../../shared/models/profile";
import { IProfileResponse, IProfilesGetResponse } from "../profiles/profiles.interface";
import { NotFoundException } from "../../shared/exceptions";
import { IProfileAddPayload, IProfileRequestPayload } from "./user-profiles.interface";
import User from "../../shared/models/user";
import logger from "../../config/logger";
import DatabaseManager from "../../config/database/db-manager";
import Service from "../../shared/models/service";
import ServiceCategory from "../../shared/models/service-category";
import { IEmailOptions } from "../../config/mailer/email.interface";
import ServicesService from "../services/services.service";
import CategoriesService from "../categories/categories.service";
import GuestRequest from "../../shared/models/guest-request";
import SheetsService from "../sheets/sheets.service";
import EmailService from "../../config/mailer";
import { MAIN_MAIL } from "../../shared/constants";
import HttpException from "../../shared/exceptions/http.exception";
import { IGuestRequestAddPayload } from "../guest-requests/guest-requests.interface";
import { IsResolvedEnum } from "../../shared/enums";

// 3rd party dependencies
import { Sequelize, Transaction } from "sequelize";

export default class UserProfilesService {

    private _servicesService = new ServicesService();
    private _sheetsService = new SheetsService();
    private _emailService = new EmailService();
    private _categoriesService = new CategoriesService();
    private _sequelize: Sequelize | null = null;
    constructor() {
        this._sequelize = DatabaseManager.getSQLInstance();
    }
    public async addUserProfile(profilePayload: IProfileAddPayload, txn?: Transaction): Promise<IProfileResponse> {
        const transaction = txn || await this._sequelize!.transaction(); // start a new transaction 

        // Check if the user exists
        const user = await User.findByPk(profilePayload.userId, { transaction });
        if (!user) {
            throw new NotFoundException('User', 'userId', profilePayload.userId);
        }

        const service = await this._servicesService.getService(profilePayload.serviceId as string);
        if (!service) {
            throw new NotFoundException('Service', 'serviceId', profilePayload.serviceId as string);
        }

        const category = await this._categoriesService.getCategory(profilePayload.categoryId as string);
        if (!category) {
            throw new NotFoundException('Category', 'categoryId', profilePayload.categoryId as string);
        }

        const serviceCategory = await ServiceCategory.findOne({ where: { serviceId: profilePayload.serviceId, categoryId: profilePayload.categoryId } });
        if (!serviceCategory) {
            throw new HttpException(400, "Service is not in the category");
        }

        if (!profilePayload.sheetUrl || !profilePayload.sheetName) {
            const sheet = await this._sheetsService.createSpreadSheet(`${user.userId}-${service.name}-${Date.now()}`, service.name);
            profilePayload.sheetUrl = sheet.spreadsheetId;
            profilePayload.sheetName = service.name;
        }

        try {
            // Create the new profile
            const newProfile = await Profile.create({ ...profilePayload, }, { transaction });

            // Associate the profile with the user
            await user.$add('profile', newProfile, { transaction });

            // Commit the transaction
            if (!txn) await transaction.commit();

            return {
                profileId: newProfile.profileId,
                marketingBudget: newProfile.marketingBudget,
                sheetUrl: newProfile.sheetUrl,
                sheetName: newProfile.sheetName,
                userId: newProfile.userId,
                serviceId: newProfile.serviceId,
                categoryId: newProfile.categoryId,
                serviceName: service.name
            };
            //eslint-disable-next-line
        } catch (error: any) {
            if (!txn) await transaction.rollback(); // Rollback the transaction in case of error
            logger.error(`Error adding profile: ${error.message}`);
            throw new Error(`Error adding profile`);
        }
    }

    public async getUserProfiles(userId: string): Promise<IProfilesGetResponse | undefined> {
        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFoundException('User', 'userId', userId);
        }

        const profiles = await user.$get('profiles', {
            include: [
                {
                    model: Service,
                    as: 'service',
                    attributes: ['name']
                }
            ]
        });
        return {
            profiles: profiles.map(profile => ({
                profileId: profile.profileId,
                marketingBudget: profile.marketingBudget,
                sheetUrl: profile.sheetUrl,
                sheetName: profile.sheetName,
                userId: profile.userId,
                serviceId: profile.serviceId,
                categoryId: profile.categoryId,
                serviceName: profile.service.name
            }))
        };
    }

    public async requestNewProfile(profilePayload: IProfileRequestPayload): Promise<void> {
        const { userId, serviceId, categoryId, marketingBudget } = profilePayload;
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFoundException('User', 'userId', userId);
        }

        const service = await this._servicesService.getService(serviceId);
        if (!service) {
            throw new NotFoundException('Service', 'serviceId', serviceId);
        }

        const category = await this._categoriesService.getCategory(categoryId);
        if (!category) {
            throw new NotFoundException('Category', 'categoryId', categoryId);
        }

        const serviceCategory = await ServiceCategory.findOne({ where: { serviceId: profilePayload.serviceId, categoryId: profilePayload.categoryId } });
        if (!serviceCategory) {
            throw new HttpException(400, "Service is not in the category");
        }

        const guestRequestPayload: IGuestRequestAddPayload = {
            guestId: user.guestId,
            serviceId: service.serviceId,
            categoryId: category.categoryId,
            marketingBudget,
        }

        const guestRequest = await GuestRequest.findOne({ where: { guestId: user.guestId, serviceId } });
        if (guestRequest) {
            throw new HttpException(400, "Guest request already exists");
        }

        await GuestRequest.create({ ...guestRequestPayload, resolved: IsResolvedEnum.PENDING, });

        const emailPayload: IEmailOptions = {
            to: MAIN_MAIL,
            template: "request-service",
            subject: 'New Service Request',
            context: {
                username: user.username,
                email: user.companyEmail,
                service: service.name,
                category: category.name,
                marketingBudget: marketingBudget,
                userId: user.userId,
                serviceId: service.serviceId,
            },
        };
        await this._emailService.sendEmail(emailPayload);
    }
}
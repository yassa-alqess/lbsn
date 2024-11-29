import { IProfileResponse, IProfileUpdatePayload } from "./profiles.interface";
import Profile from "../../shared/models/profile";
import Service from "../../shared/models/service";
import { NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";
import ServicesService from "../services/services.service";
import CategoriesService from "../categories/categories.service";
import SheetsService from "../sheets/sheets.service";
import ServiceCategory from "../../shared/models/service-category";
import HttpException from "../../shared/exceptions/http.exception";
import { MAIN_MAIL } from "../../shared/constants";

export default class ProfileService {
    private _servicesService = new ServicesService();
    private _categoriesService = new CategoriesService();
    private _sheetsService = new SheetsService();
    public async updateProfile(profilePayload: IProfileUpdatePayload): Promise<IProfileResponse | undefined> {
        const { profileId } = profilePayload;

        try {
            const profile = await Profile.findByPk(profileId, {
                include: [
                    {
                        model: Service,
                        as: 'service',
                        attributes: ['name'],
                    },
                ],
            });
            if (!profile) {
                throw new NotFoundException('Profile', 'profileId', profileId);
            }

            // if serviceId was passed in the payload and it's not the same as the old one, then create a new google sheet and update the profile sheetUrl and sheetName
            // first check for the service if it was changed, then check if the default sheet was changed
            let newSheetUrl = profile.sheetUrl;
            let newSheetName = profile.sheetName;
            if (profilePayload.serviceId && profilePayload.categoryId && profile.serviceId !== profilePayload.serviceId) {
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

                const newSheet = await this._sheetsService.createSpreadSheet(`${profile?.userId}-${category.name}-${service.name}-${Date.now()}`, service.name);
                const sheetUrl = newSheet.spreadsheetId;
                await this._sheetsService.shareSheetWithEmail(sheetUrl, MAIN_MAIL);
                newSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetUrl}`;
                newSheetName = service.name;
            }

            // the default sheet may be updated, if sheetUrl or sheetName was passed in the payload
            if (profilePayload.sheetUrl) {
                newSheetUrl = profilePayload.sheetUrl;
            }
            if (profilePayload.sheetName) {
                newSheetName = profilePayload.sheetName;
            }

            const newProfile = await profile.update({ ...profilePayload, sheetUrl: newSheetUrl, sheetName: newSheetName });
            return {
                profileId: newProfile.profileId,
                marketingBudget: newProfile.marketingBudget,
                sheetUrl: newProfile.sheetUrl,
                sheetName: newProfile.sheetName,
                userId: newProfile.userId,
                serviceId: newProfile.serviceId,
                categoryId: newProfile.categoryId,
                serviceName: newProfile.service?.name
            };

        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error updating profile: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating profile: ${error.message}`);
        }
    }

    public async getProfile(profileId: string): Promise<IProfileResponse | undefined> {
        const profile = await Profile.findByPk(profileId, {
            include: [
                {
                    model: Service,
                    as: 'service',
                    attributes: ['name'],
                },
            ],
        });
        if (!profile) {
            throw new NotFoundException('Profile', 'profileId', profileId);
        }

        return {
            profileId: profile.profileId,
            marketingBudget: profile.marketingBudget,
            sheetUrl: profile.sheetUrl,
            sheetName: profile.sheetName,
            userId: profile.userId,
            serviceId: profile.serviceId,
            categoryId: profile.categoryId,
            serviceName: profile.service?.name
        };
    }

    public async deleteProfile(profileId: string): Promise<void> {
        try {
            const profile = await Profile.findByPk(profileId);
            if (!profile) {
                throw new NotFoundException('Profile', 'profileId', profileId);
            }

            await profile.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting profile: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting profile: ${error.message}`);
        }
    }
}
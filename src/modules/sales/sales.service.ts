import logger from "../../config/logger";
import { NotFoundException } from "../../shared/exceptions";
import { LeadStatusEnum } from "../../shared/enums";
import { GroupedSales, ISale, ISaleAddPayload, ISalesGetPayload, ISalesGetResponse, ISaleUpdatePayload } from "./sales.interface";
import Sale from "../../shared/models/sale";
import Lead from "../../shared/models/lead";
import ProfileService from "../profiles/profiles.service";

// 3rd party dependencies
import { fn, col } from "sequelize";

export default class SalesService {
    private _profileService: ProfileService;
    constructor() {
        this._profileService = new ProfileService();
    }

    public async getSales(payload: ISalesGetPayload): Promise<ISalesGetResponse> {
        try {
            const { profileId, stage, limit, offset } = payload;
            // check if profile exists
            const profile = await this._profileService.getProfile(profileId);
            if (!profile) {
                throw new NotFoundException('Profile', 'profileId', profileId);
            }
            // Fetch leads and total count
            const { rows: sales, count: total } = await Sale.findAndCountAll({
                where: {
                    profileId,
                    ...(stage && { stage })
                },
                ...(limit !== undefined && { limit }),
                ...(offset !== undefined && { offset }),
                order: [['createdAt', 'DESC']]
            });

            return {
                sales: sales.map(sale => ({
                    saleId: sale.saleId,
                    stage: sale.stage,
                    dealValue: sale.dealValue,
                    dealCurrency: sale.dealCurrency,
                    comment: sale.comment,
                    record: sale.record,
                    createdAt: sale.createdAt,
                    updatedAt: sale.updatedAt
                })),
                total,
                pages: Math.ceil(total / (limit || 10))
            }
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error fetching sales: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to fetch sales: ${error.message}`);
        }
    }

    public async updateSale(payload: ISaleUpdatePayload): Promise<void> {

        try {
            const { saleId, status, otherType, stage, dealValue, dealCurrency, comment } = payload;

            const sale = await Sale.findByPk(saleId);
            if (!sale) {
                throw new NotFoundException('sale-made', 'saleId', saleId);
            }

            if (status) {
                if (status !== LeadStatusEnum.SALE_MADE) {
                    Lead.create({
                        leadId: sale.saleId,
                        profileId: sale.profileId,
                        status,
                        otherType,
                        record: sale.record
                    });

                    await sale.destroy();
                    return;
                }
                else {
                    throw new Error('Invalid status for sale update');
                }
            }
            await sale.update({
                ...(stage && { stage }),
                ...(dealValue && { dealValue }),
                ...(dealCurrency && { dealCurrency }),
                ...(comment && { comment })
            });

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating sale: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to update sale: ${error.message}`);
        }
    }

    public async getAllSalesGrouped(): Promise<GroupedSales[]> {
        try {
            // Step 1: Fetch the sales Count grouped by profileId
            const salesCount = await Sale.findAll({
                attributes: [
                    'profileId', // Group by profileId
                    [fn('COUNT', col('saleId')), 'salesCount'], // Count sales per profile
                ],
                group: ['profileId'], // Grouping by profileId
                order: [['profileId', 'ASC']] // Optional: order by profileId
            });

            // Prepare the result array
            const groupedSales: GroupedSales[] = [];

            // Step 2: Fetch all sales details for each profileId
            for (const sale of salesCount) {
                const profileId = sale.profileId;
                const sales = await Sale.findAll({
                    where: { profileId },
                    order: [['createdAt', 'ASC']] // Optional: order sales
                });

                groupedSales.push({
                    profileId,
                    salesCount: sale.get('salesCount') as number,
                    sales: sales.map(sale => sale.toJSON() as ISale)
                });
            }

            return groupedSales;
        } catch (error) {
            logger.error('Error fetching all sales:', error);
            throw new Error('Failed to fetch all leads');
        }
    }

    public async addSale(payload: ISaleAddPayload): Promise<ISale> {
        try {
            const sale = await Sale.create({ ...payload });
            const saleJson = sale.toJSON() as ISale;
            return {
                ...saleJson,
            }

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('Error adding sale:', error.message);
            throw new Error(`Error adding sale: ${error.message}`);
        }
    }
}
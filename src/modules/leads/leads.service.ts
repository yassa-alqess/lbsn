import ProfileService from "../profiles/profiles.service";
import SheetsService from "../sheets/sheets.service";
import logger from "../../config/logger";
import { NotFoundException } from "../../shared/exceptions";
import Lead from "../../shared/models/lead";
import Sale from "../../shared/models/sale";
import { LeadStatusEnum } from "../../shared/enums";
import { GroupedLeads, ILead, ILeadAddPayload, ILeadsGetPayload, ILeadsGetResponse, ILeadUpdatePayload } from "./leads.interface";
import Profile from '../../shared/models/profile';
import DatabaseManager from "../../config/database/db-manager";

import { fn, col, Sequelize } from "sequelize";
import crypto from 'crypto';

export default class LeadsService {
    private _sheetsService: SheetsService;
    private _profileService: ProfileService;
    private _sequelize: Sequelize | null = null;
    constructor() {
        this._sequelize = DatabaseManager.getSQLInstance();
        this._sheetsService = new SheetsService();
        this._profileService = new ProfileService();
    }

    //eslint-disable-next-line
    private _generateHash(data: any) {
        return crypto
            .createHash('md5')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    public async syncSheetData({ profileId, sheetUrl, sheetName }: { profileId: string, sheetUrl: string, sheetName: string }) {
        logger.info(`Syncing sheet data for profile ${profileId}...`);
        const transaction = await this._sequelize!.transaction(); // Start a transaction

        try {

            // Fetch records from Google Sheets
            const spreadsheetId = sheetUrl.split('/')[5];
            const records = await this._sheetsService.getSpreadSheetValues({
                spreadsheetId,
                sheetName,
            });

            // Generate a hash for the current sheet data
            const { hashState: oldHash } = await Profile.findOne({ where: { sheetUrl } }) as Profile;
            const newHash = this._generateHash(records);

            // If the hash is the same, skip processing
            if (oldHash && oldHash === newHash) {
                logger.info('No changes detected');
                await transaction.rollback();
                return;
            }

            // Get existing records from both Lead and Sale tables filtered by profileId
            const leadRecords = await Lead.findAll({ where: { profileId }, transaction });
            const saleRecords = await Sale.findAll({ where: { profileId }, transaction });

            const leadIds = new Set(leadRecords.map(r => r.leadId));
            const saleIds = new Set(saleRecords.map(r => r.saleId));
            const sheetIds = new Set(records.map(r => r._id));

            // Determine records to delete (in DB but not in sheet)
            const recordsToDelete = [
                ...leadRecords.filter(r => !sheetIds.has(r.leadId)),
                ...saleRecords.filter(r => !sheetIds.has(r.saleId)),
            ];

            // Determine records to create (in sheet but not in DB)
            const recordsToCreate = records.filter(r => !leadIds.has(r._id) && !saleIds.has(r._id));

            // Determine records to update (existing in Lead or Sale tables)
            const recordsToUpdate = records.filter(r => leadIds.has(r._id) || saleIds.has(r._id));

            // Perform database operations within the transaction
            await Promise.all([
                // Delete removed records from Lead or Sale tables
                ...recordsToDelete.map(async (record) => {
                    if ('leadId' in record && leadIds.has(record.leadId)) {
                        await Lead.destroy({ where: { leadId: record.leadId, profileId }, transaction });
                    }
                    if ('saleId' in record && saleIds.has(record.saleId)) {
                        await Sale.destroy({ where: { saleId: record.saleId, profileId }, transaction });
                    }
                }),

                // Create new records in the Lead table
                recordsToCreate.length > 0 &&
                Lead.bulkCreate(
                    recordsToCreate.map(record => ({
                        leadId: record._id,
                        record,
                        status: LeadStatusEnum.PENDING_VISIT,
                        profileId,
                        createdAt: new Date(record.Timestamp).toISOString(),
                    })),
                    { transaction }
                ),

                // Update existing records in Lead or Sale tables
                ...recordsToUpdate.map(async (record) => {
                    if (leadIds.has(record._id)) {
                        await Lead.update(
                            { record },
                            { where: { leadId: record._id, profileId }, transaction }
                        );
                    } else if (saleIds.has(record._id)) {
                        await Sale.update(
                            { record },
                            { where: { saleId: record._id, profileId }, transaction }
                        );
                    }
                }),
            ]);

            // Update the hash state in the database after successful sync
            await Profile.update({ hashState: newHash }, { where: { sheetUrl }, transaction });

            // Commit the transaction
            await transaction.commit();
            logger.info('Sync completed successfully');

            //eslint-disable-next-line
        } catch (error: any) {
            // Rollback the transaction on error
            await transaction.rollback();
            logger.error(`Error syncing sheet data: ${error.message}`);
            throw new Error(`Error syncing sheet data: ${error.message}`);
        }
    }


    public async getLeads(payload: ILeadsGetPayload): Promise<ILeadsGetResponse> {
        try {
            const { profileId, status, otherType, limit, offset } = payload;
            //check if this profile exists
            const profile = await this._profileService.getProfile(profileId);
            if (!profile) {
                throw new NotFoundException('Profile', 'profileId', profileId);
            }

            // Fetch leads and total count
            const { rows: leads, count: total } = await Lead.findAndCountAll({
                where: {
                    profileId,
                    ...(status && { status }),
                    ...(otherType && { otherType })
                },
                ...(limit !== undefined && { limit }),  // Apply limit only if provided
                ...(offset !== undefined && { offset }), // Apply offset only if provided
                order: [['createdAt', 'DESC']]
            });

            return {
                leads: leads.map(lead => ({
                    leadId: lead.leadId,
                    status: lead.status,
                    otherType: lead.otherType,
                    record: lead.record,
                    createdAt: lead.createdAt,
                    updatedAt: lead.updatedAt
                })),
                total,
                pages: Math.ceil(total / (limit || 10))
            }
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error fetching leads: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to fetch leads: ${error.message}`);
        }
    }

    public async updateLead(payload: ILeadUpdatePayload): Promise<void> {
        try {
            const { leadId, status } = payload;
            const lead = await this._findLeadById(leadId);

            switch (status) {
                case LeadStatusEnum.SALE_MADE:
                    await this._handleSaleMadeStatus(lead, payload);
                    break;
                case LeadStatusEnum.OTHER:
                    await this._handleOtherStatus(lead, payload);
                    break;
                default:
                    lead.status = status as LeadStatusEnum;
                    await lead.save();
            }

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating lead: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to update lead: ${error.message}`);
        }
    }

    private async _findLeadById(leadId: string): Promise<Lead> {
        const lead = await Lead.findByPk(leadId);
        if (!lead) {
            throw new NotFoundException('Lead', 'leadId', leadId);
        }
        return lead;
    }

    private async _handleSaleMadeStatus(lead: Lead, payload: ILeadUpdatePayload): Promise<void> {
        const { stage, dealValue, dealCurrency, comment } = payload;
        if (stage && dealValue && dealCurrency) {
            await Sale.create({
                saleId: lead.leadId,
                profileId: lead.profileId,
                stage,
                dealValue,
                dealCurrency,
                comment,
                record: lead.record
            });
            await lead.destroy();
        } else {
            throw new Error('Missing required fields for SALE_MADE status');
        }
    }

    private async _handleOtherStatus(lead: Lead, payload: ILeadUpdatePayload): Promise<void> {
        const { otherType } = payload;
        if (otherType) {
            lead.otherType = otherType;
        } else {
            throw new Error('Missing required fields for OTHER status');
        }
        lead.status = LeadStatusEnum.OTHER;
        await lead.save();
    }


    public async getAllLeadsGrouped(): Promise<GroupedLeads[]> {
        try {
            // Step 1: Fetch the lead counts grouped by profileId
            const leadsCount = await Lead.findAll({
                attributes: [
                    'profileId', // Group by profileId
                    [fn('COUNT', col('leadId')), 'leadsCount'], // Count leads per profile
                ],
                group: ['profileId'], // Grouping by profileId
                order: [['profileId', 'ASC']] // Optional: order by profileId
            });

            // Prepare the result array
            const groupedLeads: GroupedLeads[] = [];

            // Step 2: Fetch all leads details for each profileId
            for (const lead of leadsCount) {
                const profileId = lead.profileId;
                const leads = await Lead.findAll({
                    where: { profileId },
                    order: [['createdAt', 'ASC']] // Optional: order leads
                });

                groupedLeads.push({
                    profileId,
                    leadsCount: lead.get('leadsCount') as number,
                    leads: leads.map(lead => lead.toJSON() as ILead)
                });
            }

            return groupedLeads;
        } catch (error) {
            logger.error('Error fetching all leads: ', error);
            throw new Error('Failed to fetch all leads');
        }
    }

    public async addLead(payload: ILeadAddPayload): Promise<ILead> {
        try {
            const lead = await Lead.create({ ...payload });
            const leadJson = lead.toJSON() as ILead;
            return {
                ...leadJson
            }

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding lead: ${error.message}`);
            throw new Error(`Error adding lead: ${error.message}`);
        }
    }
}
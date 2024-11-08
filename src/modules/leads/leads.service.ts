import ProfileService from "../profiles/profiles.service";
import SheetsService from "../sheets/sheets.service";
import logger from "../../config/logger";
import { NotFoundException } from "../../shared/exceptions";
import Lead from "../../shared/models/lead";
import Sale from "../../shared/models/sale";
import { LeadStatusEnum } from "../../shared/enums";
import { GroupedLeads, ILead, ILeadAddPayload, ILeadsGetPayload, ILeadsGetResponse, ILeadUpdatePayload } from "./leads.interface";

import { fn, col } from "sequelize";
import { IProfileResponse } from "../profiles/profiles.interface";

export default class LeadsService {
    private _sheetsService: SheetsService;
    private _profileService: ProfileService;
    constructor() {
        this._sheetsService = new SheetsService();
        this._profileService = new ProfileService();
    }

    public async _syncSheetLeads(profile: IProfileResponse): Promise<void> {
        try {
            const { sheetUrl, sheetName } = profile;
            const leads = await this._sheetsService.getSpreadSheetValues({ spreadsheetId: sheetUrl.split('/')[5], sheetName });

            // Use Promise.all to insert all leads concurrently
            await Promise.all(leads.map(async (leadData) => {
                const { _id, ...record } = leadData;
                try {
                    // Find the existing lead
                    const lead = await Lead.findByPk(_id as string);

                    if (lead) {
                        // Update the existing lead
                        await Lead.update({ record }, { where: { leadId: _id as string } });

                    } else {
                        const sale = await Sale.findByPk(_id as string);

                        // Create a new lead if it does not exist and it's not a sale
                        if (!sale) await Lead.create({ leadId: _id as string, record, status: LeadStatusEnum.PENDING_VISIT, profileId: profile.profileId, createdAt: new Date(record.Timestamp).toISOString() });
                    }
                } catch (error) {
                    logger.error('Error processing lead:', error);
                    throw new Error('Error processing lead');
                    // Handle the error as needed, e.g., pushing an error message or logging
                }
            }));

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error getting sheet leads: ${error.message}`);
            throw new Error(`Error getting sheet leads: ${error.message}`);
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
            // sync the leads from the sheet
            await this._syncSheetLeads(profile);

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
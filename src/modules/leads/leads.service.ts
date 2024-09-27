import ProfileService from "../profiles/profiles.service";
import SheetsService from "../sheets/sheets.service";
import logger from "../../config/logger";
import { NotFoundException } from "../../shared/exceptions";
import Lead from "../../shared/models/lead";
import Sale from "../../shared/models/sale";
import { LeadStatusEnum } from "../../shared/enums";
import { GroupedLeads, ILead, ILeadAddPayload, ILeadsGetPayload, ILeadsGetResponse, ILeadUpdatePayload } from "./leads.interface";

import { fn, col } from "sequelize";

export default class LeadsService {
    private _sheetsService: SheetsService;
    private _profileService: ProfileService;
    constructor() {
        this._sheetsService = new SheetsService();
        this._profileService = new ProfileService();
    }

    public async getSheetLeads(profileId: string) {
        try {
            const profile = await this._profileService.getProfile(profileId);
            if (!profile) {
                throw new NotFoundException('Profile', 'profileId', profileId);
            }

            const { sheetUrl, sheetName } = profile;
            const leads = await this._sheetsService.getSpreadSheetValues({ spreadsheetId: sheetUrl.split('/')[5], sheetName });
            logger.info(`leads: ${JSON.stringify(leads)}`);

            // Use Promise.all to insert all leads concurrently
            const leadResult: ILeadsGetResponse = { leads: [], total: leads.length };
            await Promise.all(leads.map(async (leadData) => {
                const { _id, ...record } = leadData;
                try {
                    // Find the existing lead
                    const lead = await Lead.findByPk(_id as string);

                    if (lead) {
                        // Update the existing lead
                        await Lead.update({ record }, { where: { leadId: _id as string } });
                        // Fetch the updated lead
                        const updatedLead = await Lead.findByPk(_id as string);
                        if (updatedLead) {
                            leadResult.leads.push(updatedLead.toJSON() as ILead);
                        }
                    } else {
                        // Create a new lead if it does not exist
                        const newLead = await Lead.create({ leadId: _id as string, record, status: LeadStatusEnum.LEAD, profileId });
                        leadResult.leads.push(newLead.toJSON() as ILead);
                    }
                } catch (error) {
                    logger.error('Error processing lead:', error);
                    throw new Error('Error processing lead');
                    // Handle the error as needed, e.g., pushing an error message or logging
                }
            }));

            return leadResult;

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
                leads: leads.map(lead => lead.toJSON() as ILead),
                total
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

            const lead = await Lead.findByPk(leadId);
            if (!lead) {
                throw new NotFoundException('Lead', 'leadId', leadId);
            }
            if (status) {
                if (status === LeadStatusEnum.SALE_MADE) {
                    const { stage, dealValue, dealCurrency, comment } = payload;
                    if (stage && dealValue && dealCurrency) {
                        Sale.create({
                            saleId: lead.leadId,
                            profileId: lead.profileId,
                            stage,
                            dealValue,
                            dealCurrency,
                            comment
                        });
                        await lead.destroy();
                        return;
                    } else {
                        throw new Error('Missing required fields for SALE_MADE status');
                    }
                }

                lead.status = status;
                if (status === LeadStatusEnum.OTHER) {
                    const { otherType } = payload;
                    if (otherType) {
                        lead.otherType = otherType;
                    }
                }
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
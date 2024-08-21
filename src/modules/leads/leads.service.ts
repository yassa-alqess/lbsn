import ProfileService from "../profiles/profiles.service";
import SheetsService from "../sheets/sheets.service";
import logger from "../../config/logger";
import { NotFoundException } from "../../shared/exceptions";
import Lead from "../../shared/models/lead";
import { LeadStatusEnum } from "../../shared/enums";
import { GroupedLead, ILead, ILeadsGetPayload, ILeadsGetResponse, ILeadUpdatePayload } from "./leads.interface";
import DatabaseManager from "../../config/database/db-manager";

import { Sequelize, fn, col } from "sequelize";

export class LeadsService {
    private _sheetsService: SheetsService;
    private _profileService: ProfileService;
    private _sequelize: Sequelize | null = null;

    constructor() {
        this._sheetsService = new SheetsService();
        this._profileService = new ProfileService();
        this._sequelize = DatabaseManager.getSQLInstance();
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
                    // Handle the error as needed, e.g., pushing an error message or logging
                }
            }));

            return leadResult;

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error getting sheet leads: ${error.message}`);
            throw new Error(`Error getting sheet leads for profileId: ${profileId}`);
        }
    }

    public async getLeads(payload: ILeadsGetPayload): Promise<ILeadsGetResponse> {
        const { profileId, status, limit, offset } = payload;

        try {
            // Fetch leads and total count
            const { rows: leads, count: total } = await Lead.findAndCountAll({
                where: {
                    profileId,
                    ...(status && { status })
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
            logger.error('Error fetching leads:', error.message);
            throw new Error('Failed to fetch leads');
        }
    }

    public async updateLead(payload: ILeadUpdatePayload) {
        const { leadId, status } = payload;

        const lead = await Lead.findByPk(leadId);

        if (!lead) {
            throw new NotFoundException('Lead', 'leadId', leadId);
        }

        try {
            if (status) {
                lead.status = status;
            }

            await lead.save();
            return lead;

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error('Error updating lead:', error.message);
            throw new Error('Failed to update lead');
        }
    }

    public async getAllLeadsGrouped(): Promise<GroupedLead[]> {
        try {
            // Step 1: Fetch the lead counts grouped by profileId
            const leadCounts = await Lead.findAll({
                attributes: [
                    'profileId', // Group by profileId
                    [fn('COUNT', col('leadId')), 'leadCount'], // Count leads per profile
                ],
                group: ['profileId'], // Grouping by profileId
                order: [['profileId', 'ASC']] // Optional: order by profileId
            });

            // Prepare the result array
            const groupedLeads: GroupedLead[] = [];

            // Step 2: Fetch all leads details for each profileId
            for (const leadCount of leadCounts) {
                const profileId = leadCount.profileId;
                const leads = await Lead.findAll({
                    where: { profileId },
                    order: [['createdAt', 'ASC']] // Optional: order leads
                });

                groupedLeads.push({
                    profileId,
                    leadCount: leadCount.get('leadCount') as number,
                    leads: leads.map(lead => lead.toJSON() as ILead)
                });
            }

            return groupedLeads;
        } catch (error) {
            logger.error('Error fetching all leads for admin:', error);
            throw new Error('Failed to fetch all leads');
        }
    }
}
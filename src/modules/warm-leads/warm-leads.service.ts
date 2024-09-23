import { AlreadyExistsException } from '../../shared/exceptions';
import WarmLead from '../../shared/models/warm-lead';
import { IWarmLead, IWarmLeadAddPayload, IWarmLeadsResponse } from './warm-leads.interface';

export default class WarmService {
    public async addWarmLead(payload: IWarmLeadAddPayload): Promise<IWarmLead> {
        const warmLead = await WarmLead.findOne({ where: { email: payload.email } });
        if (warmLead) {
            throw new AlreadyExistsException('WarmLead', 'email', payload.email);
        }
        const newWarmLead = await WarmLead.create({ ...payload });
        return {
            ...newWarmLead.toJSON() as IWarmLead
        }
    }

    public async getAllWarmLeads(): Promise<IWarmLeadsResponse | undefined> {
        const warmLeads = await WarmLead.findAll();
        return {
            leads: warmLeads.map(lead => ({
                ...lead.toJSON() as IWarmLead
            }))
        };
    }
}
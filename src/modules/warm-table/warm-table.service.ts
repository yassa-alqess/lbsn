import WarmTable from '../../shared/models/warm-table'; // Use default import
import { IWarmAddPayload, IWarmResponse } from './warm-table.interface'; // Adjust the import path as necessary

class WarmService {
    async addWarm(payload: IWarmAddPayload): Promise<IWarmResponse> {
        const newWarm = await WarmTable.create(payload);
        return newWarm.toJSON() as IWarmResponse;
    }

    async getAllWarms(): Promise<IWarmResponse[]> {
        const warms = await WarmTable.findAll();
        return warms.map(warm => warm.toJSON() as IWarmResponse);
    }
}

export default WarmService;

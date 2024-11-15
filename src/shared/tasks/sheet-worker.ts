import { parentPort, workerData } from 'worker_threads';
import LeadsService from "../../modules/leads/leads.service";

interface WorkerData {
    profileId: string;
    sheetUrl: string;
    sheetName: string;
}

async function syncSheetData({ profileId, sheetUrl, sheetName }: WorkerData) {
    const leadsService = new LeadsService();
    await leadsService.syncSheetData({ profileId, sheetUrl, sheetName });
}

syncSheetData(workerData as WorkerData).then(() => {
    parentPort?.postMessage({ status: 'done', profileId: (workerData as WorkerData).profileId });
}).catch(err => {
    parentPort?.postMessage({ status: 'error', error: err.message });
});

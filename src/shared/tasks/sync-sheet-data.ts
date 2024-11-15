import { Worker } from 'worker_threads';
import Profile from '../models/profile';
import logger from '../../config/logger';

interface ProfileData {
    profileId: string;
    sheetUrl: string;
    sheetName: string;
}

async function createWorker(profile: ProfileData): Promise<void> {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./sheet-worker.js', {
            workerData: {
                profileId: profile.profileId,
                sheetUrl: profile.sheetUrl,
                sheetName: profile.sheetName
            }
        });

        worker.on('message', (msg) => {
            if (msg.status === 'done') {
                logger.info(`Profile ${msg.profileId} synced successfully.`);
                resolve();
            } else if (msg.status === 'error') {
                logger.error(`Error syncing profile ${msg.profileId}:`, msg.error);
                reject(new Error(msg.error));
            }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

export async function syncSheetData(): Promise<void> {
    const profiles = await Profile.findAll() as ProfileData[];

    const workerPromises = profiles.map(profile => createWorker(profile));
    await Promise.all(workerPromises);
}


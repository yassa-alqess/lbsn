import { Worker } from 'worker_threads';
import Profile from '../models/profile';
import logger from '../../config/logger';
import { ENV } from '../constants';

interface ProfileData {
    profileId: string;
    sheetUrl: string;
    sheetName: string;
}

async function createWorker(profile: ProfileData): Promise<void> {
    return new Promise((resolve, reject) => {
        let worker;
        try {
            let path;
            if (ENV === 'dev') {
                path = './src/shared/workers/sheet-worker.ts';
            }
            else if (ENV === 'prod') {
                path = './dist/shared/workers/sheet-worker.js';
            }
            worker = new Worker(`${path}`, {
                execArgv: ENV == 'dev' ? ['-r', 'ts-node/register'] : [], // Register ts-node in dev mode
                workerData: {
                    profileId: profile.profileId,
                    sheetUrl: profile.sheetUrl,
                    sheetName: profile.sheetName
                }
            });

            logger.debug(`Creating worker for profile ${profile.profileId}`);
        } catch (err) {
            logger.error(`Error creating worker for profile ${profile.profileId}:`, err);
            reject(err);
            return;
        }


        worker.on('message', (msg) => {
            if (msg.status === 'done') {
                logger.info(`Profile ${msg.profileId} synced successfully.`);
                resolve();
            } else if (msg.status === 'error') {
                logger.error(`Error syncing profile ${msg.profileId}:`, msg.error);
                reject(new Error(msg.error));
            }
        });

        worker.on('error', (err) => {
            logger.error(`Error syncing profile ${profile.profileId}:`, err);
            reject(err);
        });

        worker.on('exit', (code) => {
            logger.debug(`Worker for profile ${profile.profileId} exited with code ${code}`);
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

export async function syncSheetData(): Promise<void> {
    logger.info('Syncing sheet data for all profiles...');
    const profiles = await Profile.findAll() as ProfileData[];

    const workerPromises = profiles.map(profile => createWorker(profile));
    await Promise.all(workerPromises);
}


import * as fs from 'fs/promises';
import logger from '../../config/logger';

export async function getFileSizeAsync(filePath: string): Promise<string> {
    try {
        const stats = await fs.stat(filePath);
        return `${(stats.size / 1024).toFixed(2)}KB`; // in KB

        // eslint-disable-next-line
    } catch (err: any) {
        logger.error(`Error getting file size: ${err.message}`);
        return '0KB';
    }
}
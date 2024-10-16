import logger from "../../config/logger";
import fs from 'fs';
export function deleteFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
        if (err) {
            logger.error(`Failed to delete file: ${filePath}, Error: ${err.message}`);
        } else {
            logger.info(`file deleted: ${filePath}`);
        }
    });
}
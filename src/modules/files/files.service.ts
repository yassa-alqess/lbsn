import path from 'path';
import fs from 'fs';
import { ResourceEnum } from '../../shared/enums';
import { TASK_SUBMISSIONS_FILES_PATH, TASKS_FILES_PATH, TICKETS_FILES_PATH, USER_IMAGES_PATH } from '../../shared/constants';

export default class FilesService {
    public async getFile(resourceType: string, fileName: string): Promise<string> {
        if (!resourceType || !fileName) {
            throw new Error('Resource type and file name are required');
        }

        let dir = '';
        switch (resourceType) {
            case ResourceEnum.TASKS:
                dir = TASKS_FILES_PATH;
                break;
            case ResourceEnum.TASK_SUBMISSIONS:
                dir = TASK_SUBMISSIONS_FILES_PATH;
                break;
            case ResourceEnum.TICKETS:
                dir = TICKETS_FILES_PATH;
                break;
            case ResourceEnum.images:
                dir = USER_IMAGES_PATH;
                break;
            default:
                throw new Error('Resource type not found');
        }
        const filePath = path.join(dir, fileName);

        return new Promise((resolve, reject) => {
            // Check if the file exists
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    return reject(new Error('File not found'));
                }
                resolve(filePath);
            });
        });
    }
}
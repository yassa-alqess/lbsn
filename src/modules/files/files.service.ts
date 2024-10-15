import path from 'path';
import fs from 'fs';
import { ResourceEnum } from '../../shared/enums';

export default class FilesService {
    private _path: string = path.join(__dirname, '../../../upload');
    public async getFile(resourceType: string, fileName: string): Promise<string> {
        if (!resourceType || !fileName) {
            throw new Error('Resource type and file name are required');
        }

        let dir = '';
        switch (resourceType) {
            case ResourceEnum.TASKS:
                dir = 'tasks';
                break;
            case ResourceEnum.TASK_SUBMISSIONS:
                dir = 'tasks/submissions';
                break;
            case ResourceEnum.TICKETS:
                dir = 'tickets';
                break;
            case ResourceEnum.images:
                dir = 'users/images';
                break;
            default:
                throw new Error('Resource type not found');
        }
        const filePath = path.join(this._path, dir, fileName);

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
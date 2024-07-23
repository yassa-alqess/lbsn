import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../logger';

const getStorage = (folder: unknown) => {
	try {
		const folderPath = `./upload/${folder}`;
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
			fs.chmodSync(folderPath, '755'); 
		}
		return multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, folderPath);
			},
			filename: function (req, file, cb) {
				cb(
					null,
					path.parse(file.originalname).name +
					Date.now() +
					path.extname(file.originalname),
				);
			},
		});
	} catch (error) {
		logger.error(error);
	}
};

const upload = (folder: unknown) => {
	try {
		return multer({ storage: getStorage(folder) });
	} catch (error) {
		logger.error(error);
	}
};

export default upload;
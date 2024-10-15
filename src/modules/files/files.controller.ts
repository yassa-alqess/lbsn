import { DOWNLOAD_PATH } from "../../shared/constants";
import { Controller } from '../../shared/interfaces/controller.interface';
import logger from '../../config/logger';
import { InternalServerException, InvalidEnumValueException, ParamRequiredException } from "../../shared/exceptions";
import { ResourceEnum } from "../../shared/enums";
import FilesService from "./files.service";


// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';

export default class FilesController implements Controller {

    path = `/${DOWNLOAD_PATH}`;
    router = express.Router();
    private _filesService = new FilesService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`${this.path}`, this.downloadFile);
    }

    public downloadFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { resource, file } = req.query;
            if (!resource) return next(new ParamRequiredException('resource'));
            if (!file) return next(new ParamRequiredException('file'));
            if (!Object.values(ResourceEnum).includes(resource as ResourceEnum)) {
                throw new InvalidEnumValueException('resource');
            }

            const filePath = await this._filesService.getFile(resource as string, file as string);
            res.download(filePath);
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at downloadFile action ${error}`);
            next(new InternalServerException(error.message));
        }
    }
}
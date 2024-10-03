import { CONTACT_US_PATH } from "../../shared/constants";
import { Controller } from "../../shared/interfaces";
import { ContactUsPostDto } from "./contact-us.dto";
import { validate } from "../../shared/middlewares";
import logger from "../../config/logger";
import ContactUsService from "./contact-us.service";

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";
import { InternalServerException } from "../../shared/exceptions";

export default class ContactUsController implements Controller {

    path = `/${CONTACT_US_PATH}`;
    router = express.Router();
    private _contactUsService = new ContactUsService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.post(this.path, validate(ContactUsPostDto), this.contactUsPost);
    }

    public contactUsPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const contactUsPayload = req.body;
            await this._contactUsService.contactUsPost(contactUsPayload);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at contactUsPost action ${error}`);
            next(new InternalServerException(error.message));
        }
    }
}

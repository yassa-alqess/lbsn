// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, CATEGORIES_PATH } from '../../shared/constants';
import { ICategoryAddPayload, ICategoriesBulkAddPayload, ICategoryUpdatePayload } from './categories.interface';
import { Controller } from '../../shared/interfaces/controller.interface';
import CategoriesService from './categories.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { RoleEnum } from '../../shared/enums';
import { AlreadyExistsException, InternalServerException, InvalidIdException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import { BulkAddCategoriesDto, CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import logger from '../../config/logger';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class CategoriesController implements Controller {

    path = `/${CATEGORIES_PATH}`;
    router = express.Router();
    private _categoriesService = new CategoriesService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.get(`${this.path}/:categoryId`, this.getCategory);
        this.router.get(this.path, this.getCategories);

        this.router
            .all(`${this.path}*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))
        this.router.post(this.path, validate(CreateCategoryDto), this.addCategory);
        this.router.patch(`${this.path}/:categoryId`, validate(UpdateCategoryDto), this.updateCategory);
        this.router.delete(`${this.path}/:categoryId`, this.deleteCategory);
        this.router.post(`${this.path}/bulk`, validate(BulkAddCategoriesDto), this.bulkAddCategories);
    }

    public addCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categoryAddPayload: ICategoryAddPayload = req.body;
            const category = await this._categoriesService.addCategory(categoryAddPayload);
            res.status(StatusCodes.CREATED).json(category).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at AddCategory action ${error}`);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Category', 'name', req.body.name));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateCategory = async (req: Request, res: Response, next: NextFunction) => {
        const { categoryId } = req.params;
        if (!categoryId) return next(new ParamRequiredException('categoryId'));
        try {
            const categoryUpdatePayload: ICategoryUpdatePayload = {
                ...req.body,
                categoryId
            }
            const category = await this._categoriesService.updateCategory(categoryUpdatePayload);
            res.status(StatusCodes.OK).json(category).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateCategory action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('categoryId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Category', 'name', req.body.name));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getCategory = async (req: Request, res: Response, next: NextFunction) => {
        const { categoryId } = req.params;
        if (!categoryId) return next(new ParamRequiredException('categoryId'));

        try {
            const category = await this._categoriesService.getCategory(categoryId);
            res.status(StatusCodes.OK).json(category).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetCategory action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('categoryId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await this._categoriesService.getCategories();
            res.status(StatusCodes.OK).json(categories).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetCategories action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
        const { categoryId } = req.params;
        if (!categoryId) return next(new ParamRequiredException('categoryId'));

        try {
            await this._categoriesService.deleteCategory(categoryId);
            res.status(StatusCodes.OK).json({}).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at DeleteCategory action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('categoryId'));
            }
            if (error instanceof NotFoundException) {
                return next(new NotFoundException('Category', 'categoryId', categoryId));
            }
            next(new InternalServerException(error.message));
        }
    }

    public bulkAddCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bulkAddCategoriesPayload: ICategoriesBulkAddPayload = req.body;
            const bulkAddCategoriesResponse = await this._categoriesService.bulkAddCategories(bulkAddCategoriesPayload);
            res.status(StatusCodes.CREATED).json(bulkAddCategoriesResponse).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error at bulkAddCategories action: ${error}`);
            next(new InternalServerException(error.message));
        }
    };
}
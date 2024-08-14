// file dependinces
import { INVALID_UUID, DUPLICATE_ERR, ROLES_PATH } from '../../shared/constants';
import { Controller } from '../../shared/interfaces/controller.interface';
import { IRoleAddPayload, IRoleUpdatePayload } from './roles.interface';
import RolesService from './roles.service';
import { accessTokenGuard, requireAnyOfThoseRoles, validate } from '../../shared/middlewares';
import { RoleEnum } from '../../shared/enums';
import { CreateRoleDto, UpdateRoleDto } from './roles.dto';
import { AlreadyExistsException, InvalidIdException, InternalServerException, NotFoundException, ParamRequiredException } from '../../shared/exceptions';
import logger from '../../config/logger';

// 3rd party dependencies
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class RolesController implements Controller {

    path = ROLES_PATH;
    router = express.Router();
    private _rolesService = new RolesService();
    constructor() {
        this._initializeRoutes();
    }

    private _initializeRoutes() {
        this.router.all(`${this.path}*`, accessTokenGuard, requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]))
        this.router.post(this.path, validate(CreateRoleDto), this.addRole);
        this.router.patch(`${this.path}/:roleId`, validate(UpdateRoleDto), this.updateRole);
        this.router.get(`${this.path}/:roleId`, this.getRole);
        this.router.get(`${this.path}`, this.getRoles);
        this.router.delete(`${this.path}/:roleId`, this.deleteRole);
    }

    public addRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rolePayload: IRoleAddPayload = req.body;
            const role = await this._rolesService.addRole(rolePayload);
            res.status(StatusCodes.CREATED).json(role).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at AddRole action ${error}`);
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Role', 'name', req.body.name.toString()));
            }
            if (error instanceof AlreadyExistsException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public updateRole = async (req: Request, res: Response, next: NextFunction) => {
        const { roleId } = req.params;
        if (!roleId) return next(new ParamRequiredException('Role', 'roleId'));
        try {
            const roleUpdatePayload: IRoleUpdatePayload = {
                ...req.body,
                roleId
            }
            const role = await this._rolesService.updateRole(roleUpdatePayload);
            res.status(StatusCodes.OK).json(role).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at UpdateRole action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('roleId'));
            }
            if (error?.original?.code === DUPLICATE_ERR) { //duplicate key value violates unique constraint
                return next(new AlreadyExistsException('Role', 'name', req.body.name.toString()));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getRole = async (req: Request, res: Response, next: NextFunction) => {
        const { roleId } = req.params;
        if (!roleId) return next(new ParamRequiredException('Role', 'roleId'));
        try {
            const role = await this._rolesService.getRole(roleId);
            res.status(StatusCodes.OK).json(role).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetRole action ${error}`);
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('roleId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }

    public getRoles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const roless = await this._rolesService.getRoles();
            res.status(StatusCodes.OK).json(roless).end();

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error at GetRoles action ${error}`);
            next(new InternalServerException(error.message));
        }
    }

    public deleteRole = async (req: Request, res: Response, next: NextFunction) => {
        const { roleId } = req.params;
        if (!roleId) return next(new ParamRequiredException('Role', 'roleId'));
        try {
            await this._rolesService.deleteRole(roleId);
            res.status(StatusCodes.OK).end();

            //eslint-disable-next-line
        } catch (error: any) {
            if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
                return next(new InvalidIdException('roleId'));
            }
            if (error instanceof NotFoundException) {
                return next(error);
            }
            next(new InternalServerException(error.message));
        }
    }
}
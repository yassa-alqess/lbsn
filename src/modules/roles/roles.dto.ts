import Joi from 'joi';
import _ from 'lodash';
import { RoleEnum } from '../../shared/enums';

export const CreateRoleDto = Joi.object({
    name: Joi.string()
        .valid(..._.values(RoleEnum))
        .required()
});

export const UpdateRoleDto = Joi.object({
    name: Joi.string()
        .valid(..._.values(RoleEnum))
        .optional()
});
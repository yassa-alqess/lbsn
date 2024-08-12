import { IsLockedEnum, IsVerifiedEnum, RoleEnum } from '../../shared/enums'
import Joi from 'joi'
import _ from 'lodash'

export const CreateUserDto = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    taxId: Joi.string().optional(),
    companyName: Joi.string().required(),
    phone: Joi.string().required(),
    location: Joi.string().required(),
    password: Joi.string().min(6).required(),
    isVerified: Joi.string()
        .valid(..._.values(IsVerifiedEnum))
        .optional(),
    isLocked: Joi.string()
        .valid(..._.values(IsLockedEnum))
        .optional(),
    roles: Joi.array()
        .items(Joi.string().valid(..._.values(RoleEnum)))
        .min(1)
        .required()
})

export const UpdateUserDto = Joi.object({
    email: Joi.string().email().optional(),
    name: Joi.string().optional(),
    taxId: Joi.string().optional(),
    companyName: Joi.string().optional(),
    phone: Joi.string().optional(),
    location: Joi.string().optional(),
    password: Joi.string().min(6).optional(),
    isVerified: Joi.string()
        .valid(..._.values(IsVerifiedEnum))
        .optional(),
    isLocked: Joi.string()
        .valid(..._.values(IsLockedEnum))
        .optional(),
    roles: Joi.array()
        .items(Joi.string().valid(..._.values(RoleEnum)))
        .min(1)
        .optional()
})
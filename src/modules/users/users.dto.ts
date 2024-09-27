import { IsLockedEnum, IsVerifiedEnum, RoleEnum } from '../../shared/enums'
import Joi from 'joi'
import _ from 'lodash'

export const CreateUserDto = Joi.object({
    username: Joi.string().required(),
    userEmail: Joi.string().optional(),
    userPhone: Joi.string().optional(),
    userAddress: Joi.string().optional(),
    companytaxId: Joi.string().optional(),
    companyName: Joi.string().required(),
    companyEmail: Joi.string().required(),
    companyPhone: Joi.string().required(),
    companyAddress: Joi.string().required(),
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
    username: Joi.string().optional(),
    userEmail: Joi.string().optional(),
    userPhone: Joi.string().optional(),
    userAddress: Joi.string().optional(),
    companytaxId: Joi.string().optional(),
    companyName: Joi.string().optional(),
    companyEmail: Joi.string().optional(),
    companyPhone: Joi.string().optional(),
    companyAddress: Joi.string().optional(),
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

export const UpdateUserInfoDto = Joi.object({
    username: Joi.string().optional(),
    userEmail: Joi.string().optional(),
    userPhone: Joi.string().optional(),
    userAddress: Joi.string().optional(),
    companyTaxId: Joi.string().optional(),
    companyName: Joi.string().optional(),
    companyEmail: Joi.string().optional(),
    companyPhone: Joi.string().optional(),
    companyAddress: Joi.string().optional(),
})
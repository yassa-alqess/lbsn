import Joi from 'joi'

export const CreateGuestDto = Joi.object({
    username: Joi.string().required(),
    userEmail: Joi.string().optional(),
    userPhone: Joi.string().optional(),
    userAddress: Joi.string().optional(),
    companyTaxId: Joi.string().optional(),
    companyName: Joi.string().required(),
    companyEmail: Joi.string().required(),
    companyPhone: Joi.string().required(),
    companyAddress: Joi.string().required(),
});

export const UpdateGuestDto = Joi.object({
    username: Joi.string().optional(),
    userEmail: Joi.string().optional(),
    userPhone: Joi.string().optional(),
    userAddress: Joi.string().optional(),
    companyTaxId: Joi.string().optional(),
    companyName: Joi.string().optional(),
    companyEmail: Joi.string().optional(),
    companyPhone: Joi.string().optional(),
    companyAddress: Joi.string().optional(),
});
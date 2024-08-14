import Joi from 'joi'

export const CreateGuestDto = Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
    taxId: Joi.string().optional(),
    companyName: Joi.string().required(),
    phone: Joi.string().required(),
    location: Joi.string().required(),

});

export const UpdateGuestDto = Joi.object({
    email: Joi.string().optional(),
    name: Joi.string().optional(),
    taxId: Joi.string().optional(),
    companyName: Joi.string().optional(),
    phone: Joi.string().optional(),
    location: Joi.string().optional(),
});
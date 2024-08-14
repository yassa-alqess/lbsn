import Joi from 'joi';

export const CreateServiceDto = Joi.object({
    name: Joi.string().required(),
});

export const UpdateServiceDto = Joi.object({
    name: Joi.string().optional(),
});
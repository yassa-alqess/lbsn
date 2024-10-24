import Joi from 'joi';

export const CreateServiceDto = Joi.object({
    name: Joi.string().required(),
    categoryId: Joi.string().required(),
});

export const UpdateServiceDto = Joi.object({
    name: Joi.string().optional(),
});

export const BulkAddServicesDto = Joi.object({
    names: Joi.array()
        .items(Joi.string())
        .required(),
    categoryId: Joi.string().required()
});

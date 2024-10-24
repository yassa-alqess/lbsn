import Joi from 'joi';

export const CreateCategoryDto = Joi.object({
    name: Joi.string().required(),
});

export const UpdateCategoryDto = Joi.object({
    name: Joi.string().optional(),
});

export const BulkAddCategoriesDto = Joi.object({
    names: Joi.array()
        .items(Joi.string())
        .required(),
});

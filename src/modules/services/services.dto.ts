import Joi from 'joi';

export const CreateServiceDto = Joi.object({
    name: Joi.string().required(),
});

export const UpdateServiceDto = Joi.object({
    name: Joi.string().optional(),
});
export const AddServicesBulkDto = Joi.object({
    services: Joi.array()
        .items(Joi.string().min(1)) // Array of strings, each with at least 1 character
        .required() // Ensure that 'services' is a required field
});

import Joi from 'joi';

export const createProfileDto = Joi.object({
    name: Joi.string().required(),
});
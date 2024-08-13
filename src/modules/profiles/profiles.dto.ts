import Joi from 'joi';

export const updateProfileDto = Joi.object({
  name: Joi.string().required(),
});
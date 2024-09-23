

import Joi from 'joi';

export const CreateWarmLeadDto = Joi.object({
    fullName: Joi.string().max(200).required(),
    email: Joi.string().email().max(200).required(),
    phone: Joi.string().max(20).required(),
    companyName: Joi.string().max(200).required(),
    companyEmail: Joi.string().email().max(200).required(),
});

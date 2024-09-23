

import Joi from 'joi';

export const WarmAddDto = Joi.object({
    fullName: Joi.string().max(100).required(),
    email: Joi.string().email().max(200).required(),
    phoneNumber: Joi.string().max(15).required(),
    companyName: Joi.string().max(150).required(),
    companyEmail: Joi.string().email().max(200).required(),
});

import Joi from 'joi'

export const ContactUsPostDto = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    message: Joi.string().required(),
});
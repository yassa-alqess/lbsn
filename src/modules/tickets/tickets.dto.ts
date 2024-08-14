import Joi from 'joi';


export const CreateTicketDto = Joi.object({
    profileId: Joi.string().required(),
    title: Joi.string().required(),
    comment: Joi.string().optional(),
})

export const UpdateTicketDto = Joi.object({
    title: Joi.string().optional(),
    comment: Joi.string().optional(),
})
import Joi from 'joi';


export const CreateTicketDto = Joi.object({
    title: Joi.string().required(),
    comment: Joi.string().optional(),
})

export const UpdateTicketDto = Joi.object({
    title: Joi.string().optional(),
    comment: Joi.string().optional(),
})
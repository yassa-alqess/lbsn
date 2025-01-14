import Joi from 'joi';

export const CreateTaskDto = Joi.object({
    profileId: Joi.string().required(),
    title: Joi.string().required(),
    comment: Joi.string().optional(),
})

export const UpdateTaskDto = Joi.object({
    title: Joi.string().optional(),
    comment: Joi.string().optional(),
})



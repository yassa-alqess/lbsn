import Joi from 'joi';

export const CreateTaskSubmissionDto = Joi.object({
    title: Joi.string().required(),
    comment: Joi.string().optional(),
});

export const UpdateTaskSubmissionDto = Joi.object({
    title: Joi.string().optional(),
    comment: Joi.string().optional(),
}); 

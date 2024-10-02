import Joi from 'joi';

export const CreateTaskSubmissionDto = Joi.object({
    profileId: Joi.string().required(),
    title: Joi.string().required(),
    comment: Joi.string().optional(),
});

export const UpdateTaskSubmissionDto = Joi.object({
    profileId: Joi.string().optional(),
    title: Joi.string().optional(),
    comment: Joi.string().optional(),
}); 

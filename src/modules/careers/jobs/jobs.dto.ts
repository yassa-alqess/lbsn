import Joi from 'joi';
import _ from 'lodash';
import { JobCategoryEnum, EmploymentTypeEnum } from "../../../shared/enums";

export const CreateJobDto = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    jobCategory: Joi.string()
        .valid(..._.values(JobCategoryEnum))
        .required(),
    employmentType: Joi.string()
        .valid(..._.values(EmploymentTypeEnum))
        .required(),
    skills: Joi.array().items(Joi.string()).required()
});

export const UpdateJobDto = Joi.object({
    jobId: Joi.string().optional(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    jobCategory: Joi.string()
        .valid(..._.values(JobCategoryEnum))
        .optional(),
    employmentType: Joi.string()
        .valid(..._.values(EmploymentTypeEnum))
        .optional(),
    skills: Joi.array().items(Joi.string()).optional()
});
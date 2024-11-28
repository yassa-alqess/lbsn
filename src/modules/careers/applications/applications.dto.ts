import Joi from 'joi';
import _ from 'lodash';
import { ApplicationStatusEnum } from '../../../shared/enums';

export const CreateApplicationDto = Joi.object({
    jobId: Joi.string().uuid().required(),
    fullName: Joi.string().max(200).required(),
    address: Joi.string().max(300).required(),
    email: Joi.string().email().max(200).required(),
    phone: Joi.string().max(20).required(),
    expectedSalary: Joi.number().positive().precision(2).required(),
    education: Joi.string().max(200).required(),
    coverLetter: Joi.string().optional(),
    noticePeriod: Joi.number().integer().min(0).required(),
});

export const UpdateApplicationDto = Joi.object({
    status: Joi.string()
        .valid(..._.values(ApplicationStatusEnum))
        .required()
});
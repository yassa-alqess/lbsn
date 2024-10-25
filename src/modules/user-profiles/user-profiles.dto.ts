import Joi from 'joi';
import _ from 'lodash';
import { MarketingBudgetEnum } from '../../shared/enums';

export const CreateProfileDto = Joi.object({
    userId: Joi.string().required(),
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .required(),
    sheetUrl: Joi.string().optional(),
    sheetName: Joi.number()
        .when('sheetUrl', {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.forbidden(),
        }),
    serviceId: Joi.string().required(),
});

export const RequestProfileDto = Joi.object({
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .required(),
    serviceId: Joi.string().required(),
    categoryId: Joi.string().required(),
});
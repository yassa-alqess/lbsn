import Joi from 'joi';
import _ from 'lodash';
import { IsResolvedEnum, MarketingBudgetEnum } from '../../shared/enums';

export const CreateGuestRequestDto = Joi.object({
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .required(),
    categoryId: Joi.string().required(),
    status: Joi.string()
        .valid(..._.values(IsResolvedEnum))
        .required(),
});

export const UpdateGuestRequestDto = Joi.object({
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .optional(),
    serviceId: Joi.string().optional(),
    categoryId: Joi.string()
        .when('serviceId', {
            is: Joi.exist(),
            then: Joi.string().required(),
            otherwise: Joi.string().forbidden(),
        }),
    status: Joi.string()
        .valid(..._.values(IsResolvedEnum))
        .optional(),
});
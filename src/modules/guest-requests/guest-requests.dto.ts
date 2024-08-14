import Joi from 'joi';
import { MarketingBudgetEnum } from '../../shared/enums';
import _ from 'lodash';
export const CreateGuestRequestDto = Joi.object({
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .required(),
});

export const UpdateGuestRequestDto = Joi.object({
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .optional(),
});
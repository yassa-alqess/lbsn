import Joi from 'joi';
import _ from 'lodash';
import { MarketingBudgetEnum } from '../../shared/enums';

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
import Joi from 'joi';
import _ from 'lodash';
import { MarketingBudgetEnum } from '../../shared/enums';

export const createProfileDto = Joi.object({
    name: Joi.string().optional(),
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .optional(),
    sheetUrl: Joi.string().optional(),
});
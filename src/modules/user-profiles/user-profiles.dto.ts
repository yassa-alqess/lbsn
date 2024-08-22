import Joi from 'joi';
import _ from 'lodash';
import { MarketingBudgetEnum } from '../../shared/enums';

export const createProfileDto = Joi.object({
    name: Joi.string().required(),
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .required(),
    sheetUrl: Joi.string().required(),
    sheetName: Joi.string().required(),
});
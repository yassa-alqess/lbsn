import Joi from 'joi';
import _ from 'lodash';
import { MarketingBudgetEnum } from '../../shared/enums';

export const updateProfileDto = Joi.object({
  marketingBudget: Joi.string()
    .valid(..._.values(MarketingBudgetEnum))
    .optional(),
  sheetUrl: Joi.string().optional(),
  sheetName: Joi.number()
    .when('sheetUrl', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  serviceId: Joi.string().optional(),
});
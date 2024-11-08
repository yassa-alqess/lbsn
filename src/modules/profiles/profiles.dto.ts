import Joi from 'joi';
import _ from 'lodash';
import { MarketingBudgetEnum } from '../../shared/enums';

export const updateProfileDto = Joi.object({
  marketingBudget: Joi.string()
    .valid(..._.values(MarketingBudgetEnum))
    .optional(),
  sheetUrl: Joi.string().optional(),
  sheetName: Joi.string()
    .when('sheetUrl', {
      is: Joi.exist(),
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
  serviceId: Joi.string().optional(),
  categoryId: Joi.string()
    .when('serviceId', {
      is: Joi.exist(),
      then: Joi.string().required(),
      otherwise: Joi.string().forbidden(),
    }),
});
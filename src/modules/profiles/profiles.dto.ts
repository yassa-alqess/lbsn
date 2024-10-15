import Joi from 'joi';
import _ from 'lodash';
import { MarketingBudgetEnum } from '../../shared/enums';

export const updateProfileDto = Joi.object({
  name: Joi.string().optional(),
  marketingBudget: Joi.string()
    .valid(..._.values(MarketingBudgetEnum))
    .optional(),
  sheetUrl: Joi.string().optional(),
  sheetName: Joi.string().optional(),
  serviceId: Joi.string().optional(),
});
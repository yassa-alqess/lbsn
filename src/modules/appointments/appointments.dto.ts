import { MarketingBudgetEnum } from '../../shared/enums';
import _ from 'lodash';
import Joi from 'joi';

export const CreateAppointmentDto = Joi.object({
    username: Joi.string().required(),
    companyTaxId: Joi.string().optional(),
    companyName: Joi.string().required(),
    companyEmail: Joi.string().required(),
    companyPhone: Joi.string().required(),
    companyAddress: Joi.string().required(),
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .required(),
    timeSlot: Joi.date().required(),
    serviceId: Joi.string().required()
});
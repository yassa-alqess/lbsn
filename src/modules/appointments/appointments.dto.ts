import { MarketingBudgetEnum } from '../../shared/enums';
import _ from 'lodash';
import Joi from 'joi';

export const CreateAppointmentDto = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    companyName: Joi.string().required(),
    taxId: Joi.string().optional(),
    marketingBudget: Joi.string()
        .valid(..._.values(MarketingBudgetEnum))
        .required(),
    phone: Joi.string().required(),
    location: Joi.string().required(),
    timeSlot: Joi.date().required(),
    serviceId: Joi.string().required()
});
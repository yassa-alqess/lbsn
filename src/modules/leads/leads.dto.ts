import Joi from 'joi';
import _ from 'lodash';
import { DealCurrencyEnum, LeadStatusEnum, SalesStageEnum } from '../../shared/enums';
export const UpdateLeadSchema = Joi.object({
    profileId: Joi.string().required(),
    status: Joi.string()
        .valid(..._.values(LeadStatusEnum))
        .optional(),
    otherType: Joi.string()
        .when('status', {
            is: LeadStatusEnum.OTHER,
            then: Joi.string().required(),
            otherwise: Joi.string().forbidden(),
        }),
    dealValue: Joi.number()
        .when('status', {
            is: LeadStatusEnum.SALE_MADE,
            then: Joi.number().required(),
            otherwise: Joi.number().forbidden(),
        }),
    dealCurrency: Joi.string()
        .when('status', {
            is: LeadStatusEnum.SALE_MADE,
            then: Joi.string().valid(..._.values(DealCurrencyEnum)).required(),
            otherwise: Joi.string().forbidden(),
        }),
    stage: Joi.string()
        .when('status', {
            is: LeadStatusEnum.SALE_MADE,
            then: Joi.string().valid(..._.values(SalesStageEnum)).required(),
            otherwise: Joi.string().forbidden(),
        }),
    comment: Joi.string()
        .when('status', {
            is: LeadStatusEnum.SALE_MADE,
            then: Joi.string().optional(),
        }),
});
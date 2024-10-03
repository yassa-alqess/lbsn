import Joi from 'joi';
import _ from 'lodash';
import { DealCurrencyEnum, LeadStatusEnum, SalesStageEnum } from '../../shared/enums';
export const UpdateSaleSchema = Joi.object({
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

    stage: Joi.string()
        .valid(..._.values(SalesStageEnum))
        .when('status', {
            is: Joi.exist(),
            then: Joi.forbidden(),
            otherwise: Joi.optional(),
        }),

    dealValue: Joi.number()
        .when('status', {
            is: Joi.exist(),
            then: Joi.forbidden(),
            otherwise: Joi.optional(),
        }),

    dealCurrency: Joi.string()
        .valid(..._.values(DealCurrencyEnum))
        .when('status', {
            is: Joi.exist(),
            then: Joi.forbidden(),
            otherwise: Joi.optional(),
        }),

    comment: Joi.string()
        .when('status', {
            is: Joi.exist(),
            then: Joi.forbidden(),
            otherwise: Joi.optional(),
        }),
});
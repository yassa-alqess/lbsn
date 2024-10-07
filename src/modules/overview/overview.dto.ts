import { PeriodEnum } from '../../shared/enums';
import Joi from 'joi'
import _ from 'lodash';

export const PeriodDto = Joi.object({
    period: Joi.string()
        .valid(..._.values(PeriodEnum))
        .required(),
    start: Joi.date()
        .when('period', {
            is: PeriodEnum.CUSTOM,
            then: Joi.required(),
            otherwise: Joi.forbidden(),
        }),
    end: Joi.date()
        .when('period', {
            is: PeriodEnum.CUSTOM,
            then: Joi.required(),
            otherwise: Joi.forbidden(),
        }),
});
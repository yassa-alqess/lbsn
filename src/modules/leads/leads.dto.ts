import Joi from 'joi';
import _ from 'lodash';
import { LeadStatusEnum } from '../../shared/enums';
export const UpdateLeadSchema = Joi.object({
    status: Joi.string()
        .valid(..._.values(LeadStatusEnum))
        .optional(),
});
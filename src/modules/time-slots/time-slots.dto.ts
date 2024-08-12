import Joi from 'joi';
import _ from 'lodash';
import { IsAvailableEnum } from '../../shared/enums';

export const CreateTimeSlotDto = Joi.object({
    time: Joi.date().required(),
    isAvailable: Joi.string()
        .valid(..._.values(IsAvailableEnum))
        .required()
});

export const UpdateTimeSlotDto = Joi.object({
    time: Joi.date().optional(),
    isAvailable: Joi.string()
        .valid(..._.values(IsAvailableEnum))
        .optional()
});


export const getTimeSlotsDto = Joi.object({
    isAvailable: Joi.string()
        .valid(..._.values(IsAvailableEnum))
        .optional()
});
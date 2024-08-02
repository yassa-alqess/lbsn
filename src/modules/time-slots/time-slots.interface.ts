import { IsAvailableEnum } from "../../shared/enums";

export interface ITimeSlotAddPayload {
    time: Date;
    isAvailable: IsAvailableEnum;
}

export interface ITimeSlotResponse {
    timeSlotId: string;
    time: Date;
    isAvailable: IsAvailableEnum;
}
export interface ITimeSlotUpdatePayload {
    timeSlotId: string;
    time: Date;
    isAvailable: IsAvailableEnum;
}

export interface ITimeSlotsGetResponse {
    timeSlots: ITimeSlotResponse[]
}
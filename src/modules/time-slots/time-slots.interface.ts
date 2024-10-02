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
    isAvailable: IsAvailableEnum;
}

export interface ITimeSlotsGetResponse {
    timeSlots: ITimeSlotResponse[]
}


// time is given in UTC format (adjusted by the client)
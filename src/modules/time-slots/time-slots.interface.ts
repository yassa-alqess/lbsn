export interface ITimeSlotAddPayload {
    time: Date;
    available: boolean;
}

export interface ITimeSlotResponse {
    timeSlotId: string;
    time: Date;
    available: boolean;
}
export interface ITimeSlotUpdatePayload {
    timeSlotId: string;
    time: Date;
    available: boolean;
}

export interface ITimeSlotsGetResponse {
    timeSlots: ITimeSlotResponse[]
}
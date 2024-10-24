import { MarketingBudgetEnum } from "../../shared/enums";

export interface IAppointmentsAddPayload {
    username: string;
    companyTaxId?: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    marketingBudget: MarketingBudgetEnum;
    timeSlotId: string;
    serviceId: string;
}

export interface IAppointment {
    appointmentId: string;
    guestEmail: string;
    guestUsername?: string;
    meetingUrl: string;
    meetingJoinUrl: string;
    guestId: string;
    serviceId: string;
    serviceName: string;
    timeSlotId: string;
    time: Date;
}

export interface IAppointmentsResponse {
    appointments: IAppointment[];
    total: number;
    pages: number;
}

export interface IAppointmentsGetPayload {
    guestId: string;
    limit: number;
    offset: number;
}

export interface IAppointmentsGetAllPayload {
    limit: number;
    offset: number;
}

// Appointment time is given in UTC format by passing the adjusted timeSlotId based on the client local time.
// timeslots are given to the client in UTC format, and the client is responsible to adjust those timeSlots based on the client local tiimezone
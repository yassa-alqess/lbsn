import { MarketingBudgetEnum } from "../../shared/enums";

export interface IAppointmentsAddPayload {
    email: string;
    name: string;
    companyName: string;
    taxId?: string;
    phone: string;
    location: string;
    marketingBudget: MarketingBudgetEnum;
    timeSlot: Date;
    serviceId: string;
}


export interface IAppointment {
    appointmentId: string;
    email: string;
    name: string;
    companyName: string;
    taxId?: string;
    phone: string;
    location: string;
    marketingBudget: MarketingBudgetEnum;
    timeSlot: Date;
    serviceId: string;
}

export interface IAppointmentsResponse {
    appointments: IAppointment[];
}
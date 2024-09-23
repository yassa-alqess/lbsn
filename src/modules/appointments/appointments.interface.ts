import { MarketingBudgetEnum } from "../../shared/enums";

export interface IAppointmentsAddPayload {
    username: string;
    companyTaxId?: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    marketingBudget: MarketingBudgetEnum;
    timeSlot: Date;
    serviceId: string;
}


export interface IAppointment {
    appointmentId: string;
    username: string;
    companyTaxId?: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    marketingBudget: MarketingBudgetEnum;
    timeSlot: Date;
    serviceId: string;
}

export interface IAppointmentsResponse {
    appointments: IAppointment[];
}
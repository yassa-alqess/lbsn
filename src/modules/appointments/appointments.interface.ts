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

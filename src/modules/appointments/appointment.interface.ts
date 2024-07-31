export interface IAppointmentsAddPayload {
    email: string;
    name: string;
    companyName: string;
    taxId: string;
    phone: string;
    location: string;
    timeSlot: Date;
    serviceId: string;
}
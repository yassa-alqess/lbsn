export interface IServiceAddPayload {
    name: string;
}

export interface IServiceResponse {
    serviceId: string;
    name: string;
}
export interface IServiceUpdatePayload {
    serviceId: string;
    name?: string;
}

export interface IServicesGetResponse {
    services: IServiceResponse[]
}
export interface IServiceAddBulkPayload {
    services: string[]; // Array of service names
}
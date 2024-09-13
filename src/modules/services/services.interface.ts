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

export interface IServicesBulkAddPayload {
    names: string[];
}

export interface IServicesBulkAddResponse {
    services: IServiceResponse[]
    count: number
}

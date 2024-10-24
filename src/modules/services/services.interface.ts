export interface IServiceAddPayload {
    name: string;
    categoryId: string;
}

export interface IServiceResponse {
    serviceId: string;
    categoryId: string;
    name: string;
}
export interface IServiceUpdatePayload {
    serviceId: string;
    categoryId?: string;
    name?: string;
}

export interface IServicesGetResponse {
    services: IServiceResponse[]
}

export interface IServicesBulkAddPayload {
    names: string[];
    categoryId: string;
}

export interface IServicesBulkAddResponse {
    services: IServiceResponse[]
    count: number
}

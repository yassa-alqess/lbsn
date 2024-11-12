export interface IServiceAddPayload {
    name: string;
    categoryId: string;
}

export interface IServiceResponse {
    serviceId: string;
    categoryId?: string;
    name: string;
}
export interface IServiceUpdatePayload {
    serviceId: string;
    categoryId?: string;
    name?: string;
}

export interface IServicesGetResponse {
    categoryId: string;
    categoryName?: string;
    services: IServiceResponse[];
    count: number;
}

export interface IServicesBulkAddPayload {
    names: string[];
    categoryId: string;
}

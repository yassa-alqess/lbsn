import { IServiceAddPayload, IServiceResponse, IServicesGetResponse, IServiceUpdatePayload } from "./services.interface";
import Service from "../../shared/models/service";

export default class ServiceService {
    public async addService(servicePayload: IServiceAddPayload): Promise<IServiceResponse> {
        const service = await Service.create({ ...servicePayload });
        return {
            serviceId: service.serviceId,
            name: service.name,
        };
    }

    public async updateService(servicePayload: IServiceUpdatePayload): Promise<IServiceResponse> {
        const { serviceId } = servicePayload;
        const service = await Service.findByPk(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }
        await service.update({ ...servicePayload });
        return {
            serviceId: service.serviceId,
            name: service.name,
        };
    }
    public async getService(serviceId: string): Promise<IServiceResponse> {
        const service = await Service.findByPk(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }
        return {
            serviceId: service.serviceId,
            name: service.name,
        };
    }

    public async getServices(): Promise<IServicesGetResponse> {
        const services = await Service.findAll();
        return {
            services:
                services.map(service => ({
                    serviceId: service.serviceId,
                    name: service.name,
                }))
        }
    }

    public async deleteService(serviceId: string): Promise<void> {
        const service = await Service.findByPk(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }
        await service.destroy();
    }
}
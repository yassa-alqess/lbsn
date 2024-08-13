import { IServiceAddPayload, IServiceResponse, IServicesGetResponse, IServiceUpdatePayload } from "./services.interface";
import Service from "../../shared/models/service";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";
export default class ServicesService {
    public async addService(servicePayload: IServiceAddPayload): Promise<IServiceResponse> {
        const service = await Service.findOne({ where: { name: servicePayload.name } });
        if (service) {
            throw new AlreadyExistsException("Service", "name", servicePayload.name);
        }

        try {
            const newService = await Service.create({ ...servicePayload });
            return {
                serviceId: newService.serviceId,
                name: newService.name,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding service: ${error.message}`);
            throw new Error(`Error adding service`);
        }

    }

    public async updateService(servicePayload: IServiceUpdatePayload): Promise<IServiceResponse | undefined> {
        const { serviceId } = servicePayload;
        const service = await Service.findByPk(serviceId);
        if (!service) {
            throw new NotFoundException("Service", "serviceId", serviceId);
        }
        try {
            await service.update({ ...servicePayload });
            return {
                ...service.toJSON() as IServiceResponse,
            };
        }

        //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error updating service: ${error.message}`);
            throw new Error(`Error updating service`);
        }

    }
    
    public async getService(serviceId: string): Promise<IServiceResponse | undefined> {
        const service = await Service.findByPk(serviceId);
        if (!service) {
            throw new NotFoundException("Service", "serviceId", serviceId);
        }
        return {
            ...service.toJSON() as IServiceResponse,
        };
    }

    public async getServices(): Promise<IServicesGetResponse | undefined> {
        const services = await Service.findAll();
        return {
            services:
                services.map(service => ({
                    ...service.toJSON() as IServiceResponse,
                }))
        }
    }

    public async deleteService(serviceId: string): Promise<void> {
        const service = await Service.findByPk(serviceId);
        if (!service) {
            throw new NotFoundException("Service", "serviceId", serviceId);
        }
        try {
            await service.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting service: ${error.message}`);
            throw new Error(`Error deleting service`);
        }
    }
}
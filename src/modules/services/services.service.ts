import { IServiceAddPayload, IServiceResponse, IServicesBulkAddPayload, IServicesBulkAddResponse, IServicesGetResponse, IServiceUpdatePayload } from "./services.interface";
import Service from "../../shared/models/service";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";

export default class ServicesService {
    public async addService(servicePayload: IServiceAddPayload): Promise<IServiceResponse> {
        try {
            const service = await Service.findOne({ where: { name: servicePayload.name } });
            if (service) {
                throw new AlreadyExistsException("Service", "name", servicePayload.name);
            }
            const newService = await Service.create({ ...servicePayload });
            const newServiceJson = newService.toJSON() as IServiceResponse;
            return {
                ...newServiceJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding service: ${error.message}`);
            if (error instanceof AlreadyExistsException) {
                throw error;
            }
            throw new Error(`Error adding service: ${error.message}`);
        }

    }

    public async updateService(servicePayload: IServiceUpdatePayload): Promise<IServiceResponse | undefined> {
        const { serviceId } = servicePayload;
        try {
            const service = await Service.findByPk(serviceId);
            if (!service) {
                throw new NotFoundException("Service", "serviceId", serviceId);
            }
            const newService = await service.update({ ...servicePayload });
            const newServiceJson = newService.toJSON() as IServiceResponse;
            return {
                ...newServiceJson,
            };
        }

        //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error updating service: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating service: ${error.message}`);
        }

    }

    public async getService(serviceId: string): Promise<IServiceResponse | undefined> {
        const service = await Service.findByPk(serviceId);
        if (!service) {
            throw new NotFoundException("Service", "serviceId", serviceId);
        }

        const serviceJson = service.toJSON() as IServiceResponse;
        return {
            ...serviceJson,
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
        try {
            const service = await Service.findByPk(serviceId);
            if (!service) {
                throw new NotFoundException("Service", "serviceId", serviceId);
            }
            await service.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting service: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting service: ${error.message}`);
        }
    }

    public async getServiceByName(serviceName: string): Promise<IServiceResponse | undefined> {
        const service = await Service.findOne({ where: { name: serviceName } });
        if (!service) {
            throw new NotFoundException("Service", "name", serviceName);
        }

        const serviceJson = service.toJSON() as IServiceResponse;
        return {
            ...serviceJson,
        };
    }

    public async bulkAddServices(servicePayload: IServicesBulkAddPayload): Promise<IServicesBulkAddResponse | undefined> {
        const addedServices: IServiceResponse[] = [];

        for (const name of servicePayload.names) {
            const service = await Service.findOne({ where: { name } });

            if (service) {
                // Skip already existing services and continue with the next
                logger.info(`Service with name "${name}" already exists, skipping.`);
                continue;
            }

            try {
                const newService = await Service.create({ name });
                addedServices.push({
                    serviceId: newService.serviceId,
                    name: newService.name,
                });

                //eslint-disable-next-line
            } catch (error: any) {
                logger.error(`Error adding service "${name}": ${error.message}`);
            }
        }

        return {
            services: addedServices,
            count: addedServices.length,
        };
    }

}
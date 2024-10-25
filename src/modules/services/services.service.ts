import { IServiceAddPayload, IServiceResponse, IServicesBulkAddPayload, IServicesGetResponse, IServiceUpdatePayload } from "./services.interface";
import Service from "../../shared/models/service";
import Category from "../../shared/models/category";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";
import ServiceCategory from "../../shared/models/service-category";
import { col, fn } from "sequelize";

export default class ServicesService {
    public async addService(serviceAddPayload: IServiceAddPayload): Promise<IServiceResponse> {
        try {
            const service = await Service.findOne({ where: { name: serviceAddPayload.name } });
            if (service) {
                throw new AlreadyExistsException("Service", "name", serviceAddPayload.name);
            }

            const category = await Category.findByPk(serviceAddPayload.categoryId);
            if (!category) {
                throw new NotFoundException("Category", "categoryId", serviceAddPayload.categoryId);
            }

            const newService = await Service.create({ ...serviceAddPayload });
            category.$add('service', newService);

            const newServiceJson = newService.toJSON() as IServiceResponse;
            return {
                ...newServiceJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding service: ${error.message}`);
            if (error instanceof AlreadyExistsException || error instanceof NotFoundException) {
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
            if (servicePayload.categoryId) {
                const category = await Category.findByPk(servicePayload.categoryId);
                if (!category) {
                    throw new NotFoundException("Category", "categoryId", servicePayload.categoryId);
                }
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

    public async getServices(categoryId?: string): Promise<IServicesGetResponse[]> {
        try {
            // Step 1: Fetch the service counts grouped by categoryId
            const servicesCount = await ServiceCategory.findAll({
                attributes: [
                    'categoryId', // Group by categoryId
                    [fn('COUNT', col('serviceId')), 'servicesCount'], // Count services per category
                ],
                group: ['categoryId'], // Grouping by categoryId
                order: [['categoryId', 'ASC']], // Optional: order by categoryId
                where: categoryId ? { categoryId } : {} // Optional filter by categoryId
            });

            // Prepare the result array
            const groupedServices: IServicesGetResponse[] = [];

            // Step 2: Fetch all services details for each categoryId
            for (const serviceGroup of servicesCount) {
                const currentCategoryId = serviceGroup.categoryId;
                const serviceCategories = await ServiceCategory.findAll({
                    where: { categoryId: currentCategoryId },
                    include: [Service],
                    order: [['createdAt', 'ASC']] // Optional: order services
                });

                const services = serviceCategories.map(async (serviceCategory) => {
                    const service = await Service.findByPk(serviceCategory.serviceId);
                    return {
                        serviceId: service?.serviceId,
                        name: service?.name,
                    } as IServiceResponse;
                });
                groupedServices.push({
                    categoryId: currentCategoryId,
                    count: serviceGroup.get('servicesCount') as number,
                    services: await Promise.all(services),
                });
            }

            return groupedServices;
        }
        catch (error) {
            logger.error('Error fetching all services: ', error);
            throw new Error('Failed to fetch all services');
        }
    }

    public async deleteService(serviceId: string, categoryId?: string): Promise<void> {
        try {
            const service = await Service.findByPk(serviceId);
            if (!service) {
                throw new NotFoundException("Service", "serviceId", serviceId);
            }

            if (categoryId) {
                const serviceCategory = await ServiceCategory.findOne({
                    where: { serviceId, categoryId }
                });
                if (serviceCategory) {
                    await serviceCategory.destroy();
                    console.log(`Service with id "${serviceId}" removed from category "${categoryId}"`);
                } else {
                    console.log(`No association found for service with id "${serviceId}" in category "${categoryId}"`);
                }
            } else {
                // Delete all associations
                await ServiceCategory.destroy({ where: { serviceId } });
                // Delete the service itself
                await service.destroy();
                console.log(`Service with id "${serviceId}" and all its associations have been deleted`);
            }
            //eslint-disable-next-line
        } catch (error: any) {
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

    public async bulkAddServices(servicesBulkAddPayload: IServicesBulkAddPayload): Promise<IServicesGetResponse[]> {
        const addedServices: IServiceResponse[] = [];
        const category = await Category.findByPk(servicesBulkAddPayload.categoryId);

        if (!category) {
            throw new NotFoundException("Category", "categoryId", servicesBulkAddPayload.categoryId);
        }

        for (const name of servicesBulkAddPayload.names) {
            let service = await Service.findOne({ where: { name } });

            if (!service) {
                try {
                    service = await Service.create({ name });

                    //eslint-disable-next-line
                } catch (error: any) {
                    logger.error(`Error adding service "${name}": ${error.message}`);
                    continue;
                }
            }

            try {
                const [, created] = await ServiceCategory.findOrCreate({
                    where: { serviceId: service.serviceId, categoryId: servicesBulkAddPayload.categoryId },
                    defaults: { serviceId: service.serviceId, categoryId: servicesBulkAddPayload.categoryId }
                });

                if (created) {
                    addedServices.push({
                        serviceId: service.serviceId,
                        categoryId: servicesBulkAddPayload.categoryId,
                        name: service.name
                    });
                }

                //eslint-disable-next-line
            } catch (error: any) {
                logger.error(`Error associating service "${name}" with category "${servicesBulkAddPayload.categoryId}": ${error.message}`);
            }
        }

        // Group services by categoryId and count
        const groupedServicesMap: Record<string, IServiceResponse[]> = {};
        addedServices.forEach(service => {
            if (!groupedServicesMap[service.categoryId as string]) {
                groupedServicesMap[service.categoryId as string] = [];
            }
            groupedServicesMap[service.categoryId as string].push(service);
        });

        const groupedServices: IServicesGetResponse[] = Object.entries(groupedServicesMap).map(([categoryId, services]) => ({
            categoryId,
            count: services.length,
            services
        }));

        return groupedServices;
    }
}
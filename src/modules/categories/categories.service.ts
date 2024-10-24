import { ICategoryResponse, ICategoryAddPayload, ICategoryUpdatePayload, ICategoriesGetResponse, ICategoriesBulkAddPayload, ICategoriesBulkAddResponse } from "./categories.interface";
import Category from "../../shared/models/category";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";

export default class CategoriesCategory {
    public async addCategory(categoryAddPayload: ICategoryAddPayload): Promise<ICategoryResponse> {
        try {
            const category = await Category.findOne({ where: { name: categoryAddPayload.name } });
            if (category) {
                throw new AlreadyExistsException("Category", "name", categoryAddPayload.name);
            }
            const newCategory = await Category.create({ ...categoryAddPayload });
            const newCategoryJson = newCategory.toJSON() as ICategoryResponse;
            return {
                ...newCategoryJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding category: ${error.message}`);
            if (error instanceof AlreadyExistsException) {
                throw error;
            }
            throw new Error(`Error adding category: ${error.message}`);
        }

    }

    public async updateCategory(categoryPayload: ICategoryUpdatePayload): Promise<ICategoryResponse | undefined> {
        const { categoryId } = categoryPayload;
        try {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                throw new NotFoundException("Category", "categoryId", categoryId);
            }
            const newCategory = await category.update({ ...categoryPayload });
            const newCategoryJson = newCategory.toJSON() as ICategoryResponse;
            return {
                ...newCategoryJson,
            };
        }

        //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error updating category: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating category: ${error.message}`);
        }

    }

    public async getCategory(categoryId: string): Promise<ICategoryResponse | undefined> {
        const category = await Category.findByPk(categoryId);
        if (!category) {
            throw new NotFoundException("Category", "categoryId", categoryId);
        }

        const categoryJson = category.toJSON() as ICategoryResponse;
        return {
            ...categoryJson,
        };
    }

    public async getCategories(): Promise<ICategoriesGetResponse | undefined> {
        const categories = await Category.findAll();
        return {
            categories:
                categories.map(category => ({
                    ...category.toJSON() as ICategoryResponse,
                }))
        }
    }

    public async deleteCategory(categoryId: string): Promise<void> {
        try {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                throw new NotFoundException("Category", "categoryId", categoryId);
            }
            await category.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting category: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting category: ${error.message}`);
        }
    }

    public async getCategoryByName(categoryName: string): Promise<ICategoryResponse | undefined> {
        const category = await Category.findOne({ where: { name: categoryName } });
        if (!category) {
            throw new NotFoundException("Category", "name", categoryName);
        }

        const categoryJson = category.toJSON() as ICategoryResponse;
        return {
            ...categoryJson,
        };
    }

    public async bulkAddCategories(categoryPayload: ICategoriesBulkAddPayload): Promise<ICategoriesBulkAddResponse | undefined> {
        const addedCategories: ICategoryResponse[] = [];

        for (const name of categoryPayload.names) {
            const category = await Category.findOne({ where: { name } });

            if (category) {
                // Skip already existing categories and continue with the next
                logger.info(`Category with name "${name}" already exists, skipping.`);
                continue;
            }

            try {
                const newCategory = await Category.create({ name });
                addedCategories.push({
                    categoryId: newCategory.categoryId,
                    name: newCategory.name,
                });

                //eslint-disable-next-line
            } catch (error: any) {
                logger.error(`Error adding category "${name}": ${error.message}`);
            }
        }

        return {
            categories: addedCategories,
            count: addedCategories.length,
        };
    }

}
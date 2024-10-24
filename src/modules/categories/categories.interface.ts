export interface ICategoryAddPayload {
    name: string;
}

export interface ICategoryResponse {
    categoryId: string;
    name: string;
}
export interface ICategoryUpdatePayload {
    categoryId: string;
    name?: string;
}

export interface ICategoriesGetResponse {
    categories: ICategoryResponse[]
}

export interface ICategoriesBulkAddPayload {
    names: string[];
}

export interface ICategoriesBulkAddResponse {
    categories: ICategoryResponse[]
    count: number
}

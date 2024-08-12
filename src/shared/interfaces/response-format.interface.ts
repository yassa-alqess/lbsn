export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    //eslint-disable-next-line
    error?: any;
}
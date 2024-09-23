import { Optional } from 'sequelize';

export interface IWarmAttributes {
    Id?: string; // Optional because it's auto-generated
    fullName: string;
    email: string;
    phoneNumber: string;
    companyName: string;
    companyEmail: string;
}

export type IWarmAddPayload = Optional<IWarmAttributes, 'Id'>; // Id is auto-generated

export interface IWarmResponse extends Required<IWarmAttributes> {
    createdAt: Date;
    updatedAt: Date;
}

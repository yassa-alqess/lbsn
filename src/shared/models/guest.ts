import { Table, Model, Column, DataType, BelongsToMany, HasMany, AllowNull } from 'sequelize-typescript';
import Service from './service';
import GuestRequest from './guest-request'
import Appointment from './appointment';
import { IsApprovedEnum } from '../enums';

//3rd party dependencies
import * as _ from "lodash";

const approveStatueses: string[] = _.values(IsApprovedEnum);

@Table({ schema: 'public', timestamps: true })
class Guest extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare guestId: string;

    @Column({
        type: DataType.STRING(200),

    })
    declare username: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(200),
        unique: true,
        validate: {
            isEmail: true,
        },
    })
    declare userEmail: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(20),
    })
    declare userPhone: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(200),
    })
    declare userAddress: string;

    // Company Details
    @Column({
        type: DataType.STRING(200),
        unique: true,
    })
    declare companyTaxId: string;

    @Column({
        type: DataType.STRING(50),
    })
    declare companyName: string;

    @Column({
        type: DataType.STRING(200),
        unique: true,
        validate: {
            isEmail: true,
        },
    })
    declare companyEmail: string;

    @Column({
        type: DataType.STRING(20),
    })
    declare companyPhone: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare companyAddress: string;

    @Column({
        type: DataType.ENUM({
            values: approveStatueses
        }),

        validate: {
            isIn: [approveStatueses]
        },
    })
    declare approved: IsApprovedEnum;

    @BelongsToMany(() => Service, () => GuestRequest)
    declare services: Service[];

    @HasMany(() => Appointment)
    declare appointments: Appointment[];
}

export default Guest;

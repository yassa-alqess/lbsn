import { Table, Model, Column, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import Service from './service';
import GuestRequest from './guest-request'
import Appointment from './appointment';
import { IsApprovedEnum } from '../enums';

//3rd party dependencies
import * as _ from "lodash";

const approveStatueses: string[] = _.values(IsApprovedEnum);

@Table({ schema: 'public', timestamps: false })
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
    declare name: string;

    @Column({
        type: DataType.STRING(200),
        unique: true,
    })
    declare email: string;

    @Column({
        type: DataType.STRING(200),
        unique: true,
    })
    declare taxId: string;

    @Column({
        type: DataType.STRING(50),
    })
    declare companyName: string;

    @Column({
        type: DataType.STRING(20),
    })
    declare phone: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare location: string;

    @Column({
        type: DataType.ENUM({
            values: approveStatueses
        }),

        validate: {
            isIn: [approveStatueses]
        },
        unique: true,
    })
    declare approved: IsApprovedEnum;

    @BelongsToMany(() => Service, () => GuestRequest)
    declare services: Service[];

    @HasMany(() => Appointment)
    declare appointments: Appointment[];
}

export default Guest;

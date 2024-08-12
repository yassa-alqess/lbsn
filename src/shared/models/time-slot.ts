import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { IsAvailableEnum } from '../enums';

//3rd party dependinces
import * as _ from "lodash";

const IsAvailableEnumStatuses: string[] = _.values(IsAvailableEnum);

@Table({ schema: 'public', timestamps: false })
class TimeSlot extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare timeSlotId: string;

    @Column({
        type: DataType.DATE,
    })
    declare time: Date;

    @Column({
        type: DataType.ENUM({
            values: IsAvailableEnumStatuses
        }),

        validate: {
            isIn: [IsAvailableEnumStatuses]
        },
    })
    declare isAvailable: IsAvailableEnum;
}

export default TimeSlot;
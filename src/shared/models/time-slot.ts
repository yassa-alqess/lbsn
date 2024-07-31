 import { Table, Model, Column, DataType } from 'sequelize-typescript';


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
        type: DataType.BOOLEAN,
    })
    declare available: boolean;
}

export default TimeSlot;
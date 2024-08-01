import { Column, Table, Model, ForeignKey, DataType } from 'sequelize-typescript';
import Guest from './guest';
import Service from './service';

@Table({ schema: process.env.SCHEMA, timestamps: true })
class GuestRequest extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare guestRequestId: string;

    @ForeignKey(() => Service)
    @Column({
        type: DataType.UUID,
    })
    declare serviceId: string;


    @ForeignKey(() => Guest)
    @Column({
        type: DataType.UUID,
    })
    declare guestId: string;
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    declare resolved: boolean;
}

export default GuestRequest;

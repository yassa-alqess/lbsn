import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript';
import GuestRequest from './guest-request';
import Guest from './guest';


@Table({ schema: 'public', timestamps: true })
class Service extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare serviceId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare name: string;


    @BelongsToMany(() => Guest, () => GuestRequest)
    declare guests: Guest[];
}

export default Service;

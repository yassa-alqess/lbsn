import { Table, Model, Column, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import GuestRequest from './guest-request';
import Guest from './guest';
import Appointment from './appointment';
import Profile from './profile';
import Category from './category';
import ServiceCategory from './service-category';


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
        unique: true,
    })
    declare name: string;

    @BelongsToMany(() => Category, () => ServiceCategory)
    declare categories: Category[];

    @HasMany(() => Profile)
    declare profiles: Profile[];

    @HasMany(() => Appointment)
    declare appointments: Appointment[];

    @BelongsToMany(() => Guest, () => GuestRequest)
    declare guests: Guest[];
}

export default Service;

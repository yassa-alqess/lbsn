import {
    Table,
    Model,
    Column,
    ForeignKey,
    DataType,
} from 'sequelize-typescript';
import Service from './service';
import Category from './category';

@Table({ schema: 'public', timestamps: true })
class ServiceCategory extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare serviceCategoryId: string;

    @ForeignKey(() => Service)
    @Column({
        type: DataType.UUID,
    })
    declare serviceId: string;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.UUID,
    })
    declare categoryId: string;
}

export default ServiceCategory;
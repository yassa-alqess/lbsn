import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript';
import Service from './service';
import ServiceCategory from './service-category';


@Table({ schema: 'public', timestamps: true })
class Category extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare categoryId: string;

    @Column({
        type: DataType.STRING(200),
        unique: true,
    })
    declare name: string;

    @BelongsToMany(() => Service, () => ServiceCategory)
    declare services: Service[];
}

export default Category;

import {
    Table,
    Model,
    Column,
    DataType,
    BelongsToMany,
} from 'sequelize-typescript';
import RolePermission from './role-permission';
import Role from './role';

@Table({ schema: process.env.SCHEMA })
class Permission extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare permissionId: string;

    @Column({
        type: DataType.STRING,
    })
    declare name: string;

    @BelongsToMany(() => Role, () => RolePermission)
    declare roles: Role[];
}

export default Permission;
import {
    Table,
    Model,
    Column,
    DataType,
    BelongsToMany,
} from 'sequelize-typescript';
import UserRole from './user-role';
import RolePermission from './role-permission';
import User from './user';
import Permission from './permission';

@Table({ schema: process.env.SCHEMA })
class Role extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare roleId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare name: string;

    @BelongsToMany(() => User, () => UserRole)
    declare users: User[];

    @BelongsToMany(() => Permission, () => RolePermission)
    declare permissions: Permission[];
}

export default Role;
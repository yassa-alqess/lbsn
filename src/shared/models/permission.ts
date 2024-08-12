import {
    Table,
    Model,
    Column,
    DataType,
    BelongsToMany,
} from 'sequelize-typescript';
import RolePermission from './role-permission';
import Role from './role';
import { PermissionEnum } from '../enums';

//3rd party imports
import * as _ from "lodash";

const permissions: string[] = _.values(PermissionEnum);

@Table({ schema: process.env.SCHEMA })
class Permission extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare permissionId: string;

    @Column({
        type: DataType.ENUM({
            values: permissions
        }),
        validate: {
            isIn: [permissions]
        },
    })
    declare name: PermissionEnum;

    @BelongsToMany(() => Role, () => RolePermission)
    declare roles: Role[];
}

export default Permission;
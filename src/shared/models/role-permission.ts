import {
  Table,
  Model,
  Column,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import Role from './role';
import Permission from './permission';

@Table({ schema: 'public', timestamps: true })
class RolePermission extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare rolePermissionId: string;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
  })
  declare roleId: string;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.UUID,
  })
  declare permissionId: string;
}

export default RolePermission;
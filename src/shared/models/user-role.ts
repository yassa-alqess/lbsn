import {
    Table,
    Model,
    Column,
    ForeignKey,
    DataType,
} from 'sequelize-typescript';
import Role from './role';
import User from './user';

@Table({ schema: 'public', timestamps: true })
class UserRole extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare userRoleId: string;

    @ForeignKey(() => Role)
    @Column({
        type: DataType.UUID,
    })
    declare roleId: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
    })
    declare userId: string;
}

export default UserRole;
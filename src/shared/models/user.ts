import { Table, Model, Column, DataType, BelongsToMany, AllowNull, HasMany } from 'sequelize-typescript';
import Profile from './profile';
import RefreshToken from './refresh-token';
import ResetToken from './reset-token';
import Role from './role';
import UserRole from './user-role';
import { IsLockedEnum, IsVerifiedEnum } from '../enums';

//3rd party dependinces
import * as _ from "lodash";

const isVerifiedEnumStatuses: string[] = _.values(IsVerifiedEnum);
const isLockedEnumStatuses: string[] = _.values(IsLockedEnum);

@Table({ schema: 'public', timestamps: true })
class User extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING(200),

  })
  declare name: string;

  @Column({
    type: DataType.STRING(200),
    unique: true,
  })
  declare email: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(200),
    unique: true,
  })
  declare taxId: string;

  @Column({
    type: DataType.ENUM({
      values: isVerifiedEnumStatuses
    }),

    validate: {
      isIn: [isVerifiedEnumStatuses]
    },
  })
  declare isVerified: IsVerifiedEnum;

  @Column({
    type: DataType.STRING(50),
  })
  declare companyName: string;

  @Column({
    type: DataType.STRING(20),
  })
  declare phone: string;

  @Column({
    type: DataType.STRING(200),
  })
  declare location: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare image: string;

  @Column({
    type: DataType.STRING(200),
  })
  declare password: string;

  @Column({
    type: DataType.ENUM({
      values: isLockedEnumStatuses
    }),

    validate: {
      isIn: [isLockedEnumStatuses]
    },
  })
  declare isLocked: IsLockedEnum;

  @HasMany(() => Profile)
  declare profiles: Profile[];

  @HasMany(() => RefreshToken)
  declare refreshTokens: RefreshToken[];

  @HasMany(() => ResetToken)
  declare resetTokens: ResetToken[];

  @BelongsToMany(() => Role, () => UserRole)
  declare roles: Role[];
}

export default User;

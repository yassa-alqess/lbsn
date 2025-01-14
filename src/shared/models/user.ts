import { Table, Model, Column, DataType, BelongsToMany, AllowNull, HasMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import Profile from './profile';
import RefreshToken from './refresh-token';
import Role from './role';
import UserRole from './user-role';
import Guest from './guest';
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
  declare username: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(200),
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare userEmail: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(20),
  })
  declare userPhone: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(200),
  })
  declare userAddress: string;

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
      values: isVerifiedEnumStatuses
    }),

    validate: {
      isIn: [isVerifiedEnumStatuses]
    },
  })
  declare isVerified: IsVerifiedEnum;

  @Column({
    type: DataType.ENUM({
      values: isLockedEnumStatuses
    }),

    validate: {
      isIn: [isLockedEnumStatuses]
    },
  })
  declare isLocked: IsLockedEnum;

  // Company Details
  @Column({
    type: DataType.STRING(200),
    unique: true,
  })
  declare companyTaxId: string;

  @Column({
    type: DataType.STRING(200),
  })
  declare companyName: string;

  @Column({
    type: DataType.STRING(200),
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare companyEmail: string;

  @Column({
    type: DataType.STRING(20),
  })
  declare companyPhone: string;

  @Column({
    type: DataType.STRING(200),
  })
  declare companyAddress: string;

  @HasMany(() => Profile)
  declare profiles: Profile[];

  @HasMany(() => RefreshToken)
  declare refreshTokens: RefreshToken[];

  @BelongsToMany(() => Role, () => UserRole)
  declare roles: Role[];


  @ForeignKey(() => Guest)
  @Column({
    type: DataType.UUID,
  })
  declare guestId: string;

  @BelongsTo(() => Guest, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare guest: Guest;
}

export default User;

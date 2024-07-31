import { Table, Model, Column, DataType, BelongsToMany, AllowNull, HasMany } from 'sequelize-typescript';
import UserProfile from './user-profile';
import Profile from './profile';
import RefreshToken from './refresh-token';
import ResetToken from './reset-token';


@Table({ schema: 'public', timestamps: false })
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

  @Column({
    type: DataType.STRING(200),
    unique: true,
  })
  declare taxId: string;

  @Column({
    type: DataType.INTEGER,
  })
  declare role: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  declare isVerified: boolean;

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
    type: DataType.STRING(200),
  })
  declare image: string;

  @Column({
    type: DataType.STRING(200),
  })
  declare password: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  declare isLocked: boolean;

  @BelongsToMany(() => Profile, () => UserProfile)
  declare profiles: Profile[];

  @HasMany(() => RefreshToken)
  declare refreshTokens: RefreshToken[];

  @HasMany(() => ResetToken)
  declare resetTokens: ResetToken[];
}

export default User;

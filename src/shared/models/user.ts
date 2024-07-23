import { Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript';
import UserProfile from './user-profile';
import Profile from './profile';


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
  declare displayName: string;

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
    type: DataType.INTEGER,
  })
  declare IsVerified: number;

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
  declare isLocked: number;

  @BelongsToMany(() => Profile, () => UserProfile)
  declare profiles: Profile[];
}

export default User;

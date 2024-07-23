import { Column, Table, Model, ForeignKey, DataType } from 'sequelize-typescript';
import User from './user';
import Profile from './profile';

@Table({ schema: process.env.SCHEMA, timestamps: true })
class UserProfile extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare userProfileId: string;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.UUID,
  })
  declare profileId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  declare userId: string;

}

export default UserProfile;

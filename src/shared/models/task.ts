import { Table, Model, Column, DataType, BelongsTo, HasOne } from 'sequelize-typescript';
import Profile from './profile';
import TaskSubmission from './task-submission';


@Table({ schema: 'public', timestamps: true })
class Task extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare taskId: string;

  @Column({
    type: DataType.STRING(200),
  })
  declare title: string;

  @Column({
    type: DataType.STRING(200),
  })
  declare comment: string;

  @Column({
    type: DataType.INTEGER,
  })
  declare status: string;

  @BelongsTo(() => Profile, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare profile: Profile;

  @HasOne(() => TaskSubmission, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare taskSubmission: TaskSubmission;

}

export default Task;

import { Table, Model, Column, DataType, BelongsTo, HasOne, ForeignKey, AllowNull } from 'sequelize-typescript';
import Profile from './profile';
import TaskSubmission from './task-submission';
import { TaskStatusEnum } from '../enums';

//3rd party dependinces
import * as _ from "lodash";

const statueses: string[] = _.values(TaskStatusEnum);
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
    type: DataType.TEXT,
  })
  declare comment: string;

  @Column({
    type: DataType.ENUM({
      values: statueses
    }),

    validate: {
      isIn: [statueses]
    },
  })
  declare status: TaskStatusEnum;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.UUID,
  })
  declare profileId: string;

  @BelongsTo(() => Profile, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare profile: Profile;

  @HasOne(() => TaskSubmission, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare taskSubmission: TaskSubmission;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
  })
  declare submittedAt: Date;

}

export default Task;

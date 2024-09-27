import { Table, Model, Column, DataType, BelongsTo, ForeignKey, AllowNull } from 'sequelize-typescript';
import Task from './task';
import { TaskSubmissionStatusEnum } from '../enums';

//3rd party dependinces
import * as _ from "lodash";

const statueses: string[] = _.values(TaskSubmissionStatusEnum);

@Table({ schema: 'public', timestamps: true })
class TaskSubmission extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare taskSubmissionId: string;

    @Column({
        type: DataType.TEXT,
    })
    declare documentUrl: string;

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
    declare status: TaskSubmissionStatusEnum;

    @AllowNull(true)
    @Column({
        type: DataType.DATE,
    })
    declare approvedAt: Date;

    @ForeignKey(() => Task)
    @Column({
        type: DataType.UUID,
    })
    declare taskId: string;

    @BelongsTo(() => Task, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare task: Task;
}

export default TaskSubmission;

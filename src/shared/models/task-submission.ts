import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
// import Profile from './profile';
import Task from './task';


@Table({ schema: 'public', timestamps: true })
class TaskSubmission extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare taskSubmissionId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare documentUrl: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare title: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare comment: string;

    @ForeignKey(() => Task)
    @Column({
        type: DataType.UUID,
    })
    declare taskId: number;

    @BelongsTo(() => Task, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare task: Task;
}

export default TaskSubmission;

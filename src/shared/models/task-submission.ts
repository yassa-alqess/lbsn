import { Table, Model, Column, DataType, BelongsTo } from 'sequelize-typescript';
import Profile from './profile';
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

    @BelongsTo(() => Profile, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare profile: Profile;

    @BelongsTo(() => Task, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare task: Task;
}

export default TaskSubmission;

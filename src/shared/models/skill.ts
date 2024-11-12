import {
    Table,
    Model,
    Column,
    DataType,
    BelongsTo,
    ForeignKey,
} from 'sequelize-typescript';
import Job from './job';

@Table({ schema: 'public', timestamps: true })
class Skill extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare skillId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare name: string;

    @ForeignKey(() => Job)
    @Column({
        type: DataType.UUID,
    })
    declare jobId: string;

    @BelongsTo(() => Job, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare job: Job;
}

export default Skill;
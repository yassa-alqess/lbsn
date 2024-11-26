import {
    Table,
    Model,
    Column,
    DataType,
    BelongsToMany,
} from 'sequelize-typescript';
import Job from './job';
import JobSkill from './job-skill';

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

    @BelongsToMany(() => Job, () => JobSkill)
    declare users: Job[];
}

export default Skill;
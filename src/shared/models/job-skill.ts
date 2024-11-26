import {
    Table,
    Model,
    Column,
    ForeignKey,
    DataType,
} from 'sequelize-typescript';
import Job from './job';
import Skill from './skill';


@Table({ schema: 'public', timestamps: true })
class JobSkill extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare jobSkillId: string;

    @ForeignKey(() => Job)
    @Column({
        type: DataType.UUID,
    })
    declare jobId: string;

    @ForeignKey(() => Skill)
    @Column({
        type: DataType.UUID,
    })
    declare skillId: string;
}

export default JobSkill;
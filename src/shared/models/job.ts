import {
    Table,
    Model,
    Column,
    DataType,
    BelongsToMany,
} from 'sequelize-typescript';
import { JobCategoryEnum, EmploymentTypeEnum } from '../enums';
import Skill from './skill';

//3rd party imports
import * as _ from "lodash";
import JobSkill from './job-skill';
const jobCategories: string[] = _.values(JobCategoryEnum);
const employmentTypes: string[] = _.values(EmploymentTypeEnum);


@Table({ schema: 'public', timestamps: true })
class Job extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare jobId: string;

    @Column({
        type: DataType.STRING(200),
        unique: true,
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
    })
    declare description: string;

    @Column({
        type: DataType.ENUM({
            values: jobCategories
        }),

        validate: {
            isIn: [jobCategories]
        },
    })
    declare jobCategory: JobCategoryEnum;

    @Column({
        type: DataType.ENUM({
            values: employmentTypes
        }),

        validate: {
            isIn: [employmentTypes]
        },
    })
    declare employmentType: EmploymentTypeEnum;

    @BelongsToMany(() => Skill, () => JobSkill)
    declare skills: Skill[];
}

export default Job;
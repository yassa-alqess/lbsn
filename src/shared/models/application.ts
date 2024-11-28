import {
    Model,
    Column,
    Table,
    DataType,
    AllowNull,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import Job from './job';
import { ApplicationStatusEnum } from '../enums';

//3rd party dependencies
import * as _ from "lodash";

const applicationStatuses: string[] = _.values(ApplicationStatusEnum);

@Table({ schema: 'public', timestamps: true })
class Application extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare applicationId: string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
    })
    declare fullName: string;

    @Column({
        type: DataType.STRING(300),
        allowNull: false,
    })
    declare address: string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
        validate: {
            isEmail: true,
        },
    })
    declare email: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    declare phone: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare expectedSalary: number;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
    })
    declare education: string;

    @AllowNull(true)
    @Column({
        type: DataType.TEXT,
    })
    declare coverLetter: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare noticePeriod: number;

    @Column({
        type: DataType.STRING(500),
        allowNull: false,
    })
    declare resume: string;

    @Column({
        type: DataType.ENUM({
            values: applicationStatuses
        }),

        validate: {
            isIn: [applicationStatuses]
        },
    })
    declare status: ApplicationStatusEnum;

    @ForeignKey(() => Job)
    @Column({
        type: DataType.UUID,
    })
    declare jobId: string;

    @BelongsTo(() => Job, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare job: Job;
}

export default Application;
import { Table, Model, Column, DataType, BelongsTo, ForeignKey, AllowNull, } from 'sequelize-typescript';
import Profile from './profile';
import { LeadStatusEnum } from '../enums';

//3rd party imports
import * as _ from "lodash";

const statuses: string[] = _.values(LeadStatusEnum);

@Table({ schema: 'public', timestamps: true })
class Lead extends Model {
    @Column({
        primaryKey: true,
        type: DataType.STRING(200),
    })
    declare leadId: string;

    @Column({
        type: DataType.ENUM({
            values: statuses
        }),

        validate: {
            isIn: [statuses]
        },
    })
    declare status: LeadStatusEnum;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(200),
    })
    declare otherType: string;

    @Column({
        type: DataType.JSONB,
    })
    declare record: object; // binary json

    @ForeignKey(() => Profile)
    @Column({
        type: DataType.UUID,
    })
    declare profileId: string;

    @BelongsTo(() => Profile, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare profile: Profile;
}

export default Lead;

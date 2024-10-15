import { Table, Model, Column, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Ticket from './ticket';
import Task from './task';
import Lead from './lead';
import User from './user';
import Service from './service';
import { MarketingBudgetEnum } from '../enums';

//3rd party dependencies
import * as _ from "lodash";

const marketingBudgetEnumValues: string[] = _.values(MarketingBudgetEnum);

@Table({ schema: 'public', timestamps: true })
class Profile extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare profileId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare name: string;

    @Column({
        type: DataType.TEXT,
    })
    declare sheetUrl: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare sheetName: string;

    @Column({
        type: DataType.ENUM({
            values: marketingBudgetEnumValues
        }),

        validate: {
            isIn: [marketingBudgetEnumValues]
        },
    })
    declare marketingBudget: MarketingBudgetEnum;

    @HasMany(() => Ticket)
    declare tickets: Ticket[];

    @HasMany(() => Ticket)
    declare tasks: Task[];

    @HasMany(() => Lead)
    declare leads: Lead[];

    @ForeignKey(() => Service)
    @Column({
        type: DataType.UUID,
    })
    declare serviceId: string;

    @BelongsTo(() => Service, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare service: Service;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
    })
    declare userId: string;

    @BelongsTo(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare user: User;
}

export default Profile;

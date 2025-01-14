import { Table, Model, Column, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Ticket from './ticket';
import Task from './task';
import Lead from './lead';
import User from './user';
import Service from './service';
import GuestRequest from './guest-request';
import { MarketingBudgetEnum } from '../enums';
import Category from './category';

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
        type: DataType.TEXT,
    })
    declare sheetUrl: string;

    @Column({
        type: DataType.TEXT,
    })
    declare hashState: string;

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

    @ForeignKey(() => Category)
    @Column({
        type: DataType.UUID,
    })
    declare categoryId: string;

    @BelongsTo(() => Category, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare category: Category;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
    })
    declare userId: string;

    @BelongsTo(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare user: User;

    @ForeignKey(() => GuestRequest)
    @Column({
        type: DataType.UUID,
    })
    declare requestId: string;

    @BelongsTo(() => GuestRequest, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare request: GuestRequest;
}

export default Profile;

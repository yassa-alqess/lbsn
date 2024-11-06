import { Column, Table, Model, ForeignKey, DataType, BelongsTo, HasOne } from 'sequelize-typescript';
import Guest from './guest';
import Service from './service';
import Category from './category';
import { IsResolvedEnum, MarketingBudgetEnum } from '../enums';

//3rd party dependencies
import * as _ from "lodash";
import Profile from './profile';

const isResolvedStatueses: string[] = _.values(IsResolvedEnum);
const marketingBudgetEnumValues: string[] = _.values(MarketingBudgetEnum);

@Table({ schema: process.env.SCHEMA, timestamps: true })
class GuestRequest extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare guestRequestId: string;

    @ForeignKey(() => Service)
    @Column({
        type: DataType.UUID,
    })
    declare serviceId: string;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.UUID,
    })
    declare categoryId: string;

    @ForeignKey(() => Guest)
    @Column({
        type: DataType.UUID,
    })
    declare guestId: string;

    @Column({
        type: DataType.ENUM({
            values: isResolvedStatueses
        }),

        validate: {
            isIn: [isResolvedStatueses]
        },
    })
    declare resolved: IsResolvedEnum;

    @Column({
        type: DataType.ENUM({
            values: marketingBudgetEnumValues
        }),

        validate: {
            isIn: [marketingBudgetEnumValues]
        },
    })
    declare marketingBudget: MarketingBudgetEnum;

    // Define association
    @BelongsTo(() => Guest, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    guest!: Guest;

    @BelongsTo(() => Service, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    service!: Service;

    @BelongsTo(() => Category, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    category!: Category;

    @HasOne(() => Profile)
    profile!: Profile;
}

export default GuestRequest;

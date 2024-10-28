import { Column, Table, Model, ForeignKey, DataType, BelongsTo, HasOne } from 'sequelize-typescript';
import Guest from './guest';
import Service from './service';
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
    @BelongsTo(() => Guest)
    guest!: Guest;

    @BelongsTo(() => Service)
    service!: Service;

    @HasOne(() => Profile)
    profile!: Profile;
}

export default GuestRequest;

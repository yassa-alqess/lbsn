import { Table, Model, Column, DataType, BelongsTo, ForeignKey, AllowNull, } from 'sequelize-typescript';
import Profile from './profile';
import { DealCurrencyEnum, SalesStageEnum } from '../enums';

//3rd party imports
import * as _ from "lodash";

const stages: string[] = _.values(SalesStageEnum);
const currencyTypes: string[] = _.values(DealCurrencyEnum);

@Table({ schema: 'public', timestamps: true })
class Sale extends Model {
    @Column({
        primaryKey: true,
        type: DataType.STRING(200),
    })
    declare saleId: string;

    @Column({
        type: DataType.ENUM({
            values: stages
        }),

        validate: {
            isIn: [stages]
        },
    })
    declare stage: SalesStageEnum;

    //deal value
    @Column({
        type: DataType.INTEGER,
    })
    declare dealValue: number;

    //currency
    @Column({
        type: DataType.ENUM({
            values: currencyTypes
        }),

        validate: {
            isIn: [currencyTypes]
        },
    })
    declare dealCurrency: DealCurrencyEnum;

    //comment
    @AllowNull(true)
    @Column({
        type: DataType.STRING(200),
    })
    declare comment: string;

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

export default Sale;

import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import Profile from './profile';
import { TicketStatusEnum } from '../enums';

//3rd party dependinces
import * as _ from "lodash";

const statueses: string[] = _.values(TicketStatusEnum);

@Table({ schema: 'public', timestamps: true })
class Ticket extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare ticketId: string;

    @Column({
        type: DataType.TEXT,
    })
    declare documentUrl: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
    })
    declare comment: string;

    @Column({
        type: DataType.ENUM({
            values: statueses
        }),

        validate: {
            isIn: [statueses]
        },
    })
    declare status: TicketStatusEnum;

    @ForeignKey(() => Profile)
    @Column({
        type: DataType.UUID,
    })
    declare profileId: string;

    @BelongsTo(() => Profile, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare profile: Profile;
}

export default Ticket;

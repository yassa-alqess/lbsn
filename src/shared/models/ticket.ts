import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import Profile from './profile';


@Table({ schema: 'public', timestamps: true })
class Ticket extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare ticketId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare documentUrl: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare title: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare comment: string;

    @Column({
        type: DataType.INTEGER,
    })
    declare status: number;

    @ForeignKey(() => Profile)
    @Column({
        type: DataType.UUID,
    })
    declare profileId: number;

    @BelongsTo(() => Profile, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare profile: Profile;
}

export default Ticket;

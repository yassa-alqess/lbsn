import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Guest from './guest';

@Table({ schema: 'public', timestamps: true })
class Appointment extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare appointmentId: string;

    @Column({
        type: DataType.DATE,
    })
    declare time: Date;

    @Column({
        type: DataType.STRING(200),
    })
    declare guestEmail: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare meetingUrl: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare meetingJoinUrl: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare meetingPassword: string;

    @ForeignKey(() => Guest)
    @Column({
        type: DataType.UUID,
    })
    declare guestId: number;

    @BelongsTo(() => Guest, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare guest: Guest;
}

export default Appointment;
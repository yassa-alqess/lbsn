import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Guest from './guest';
import Service from './service';
import TimeSlot from './time-slot';

@Table({ schema: 'public', timestamps: true })
class Appointment extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare appointmentId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare guestEmail: string;

    @Column({
        type: DataType.TEXT,
    })
    declare meetingUrl: string;

    @Column({
        type: DataType.TEXT,
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
    declare guestId: string;

    @ForeignKey(() => Service)
    @Column({
        type: DataType.UUID,
    })
    declare serviceId: string;

    @ForeignKey(() => TimeSlot)
    @Column({
        type: DataType.UUID,
    })
    declare timeSlotId: string;


    @BelongsTo(() => Guest, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare guest: Guest;
}

export default Appointment;
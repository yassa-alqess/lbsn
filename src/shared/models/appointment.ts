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

    @BelongsTo(() => Guest, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare guest: Guest;

    @ForeignKey(() => Service)
    @Column({
        type: DataType.UUID,
    })
    declare serviceId: string;

    @BelongsTo(() => Service, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare service: Service;

    @ForeignKey(() => TimeSlot)
    @Column({
        type: DataType.UUID,
    })
    declare timeSlotId: string;

    @BelongsTo(() => TimeSlot, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare timeSlot: TimeSlot;
}

export default Appointment;
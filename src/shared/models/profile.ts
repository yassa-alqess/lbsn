import { Table, Model, Column, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import Ticket from './ticket';
import Task from './task';
import Lead from './lead';
import UserProfile from './user-profile';
import User from './user';


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

    @HasMany(() => Ticket)
    declare tickets: Ticket[];

    @HasMany(() => Ticket)
    declare tasks: Task[];

    @HasMany(() => Lead)
    declare leads: Lead[];

    @BelongsToMany(() => User, () => UserProfile)
    declare users: User[];
}

export default Profile;

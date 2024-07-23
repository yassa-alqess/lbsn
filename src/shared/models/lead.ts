import { Table, Model, Column, DataType, BelongsTo, } from 'sequelize-typescript';
import Profile from './profile';


@Table({ schema: 'public', timestamps: true })
class Lead extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare leadId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare sheetUrl: string;

    @Column({
        type: DataType.INTEGER,
    })
    declare status: string;

    @BelongsTo(() => Profile, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare profile: Profile;
}

export default Lead;

import { Table, Model, Column, DataType, BelongsTo } from 'sequelize-typescript';
import User from './user';

@Table({ schema: 'public', timestamps: true })
class Token extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare tokenId: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare name: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare value: string;

    @BelongsTo(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare profile: User;
}

export default Token;

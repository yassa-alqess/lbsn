import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import User from './user';

@Table({ schema: 'public', timestamps: true })
class RefreshToken extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare tokenId: string;

    @Column({
        type: DataType.TEXT,
    })
    declare value: string;

    @Column({
        type: DataType.DATE,
    })
    declare expiresAt: Date;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
    })
    declare userId: string;

    @BelongsTo(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare user: User;
}

export default RefreshToken;

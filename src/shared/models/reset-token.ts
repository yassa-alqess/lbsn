import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import User from './user';

@Table({ schema: 'public', timestamps: true })
class ResetToken extends Model {
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

    @Column({
        type: DataType.DATE,
    })
    declare expiresAt: Date;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
    })
    declare userId: number;

    @BelongsTo(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    declare user: User;
}

export default ResetToken;

import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({ schema: 'public', timestamps: true })
class WarmLead extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare Id: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare fullName: string;

    @Column({
        type: DataType.STRING(200),
        validate: {
            isEmail: true,
        },
    })
    declare email: string;

    @Column({
        type: DataType.STRING(20),
    })
    declare phone: string;

    @Column({
        type: DataType.STRING(200),
    })
    declare companyName: string;

    @Column({
        type: DataType.STRING(200),
        validate: {
            isEmail: true,
        },
    })
    declare companyEmail: string;
}

export default WarmLead;
import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({ schema: 'public', timestamps: true })
class Company extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare Id: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare fullName: string; // Full Name

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
        validate: {
            isEmail: true,
        },
    })
    declare email: string; // Email

    @Column({
        type: DataType.STRING(15),
        allowNull: false,
    })
    declare phoneNumber: string; // Phone Number

    @Column({
        type: DataType.STRING(150),
        allowNull: false,
    })
    declare companyName: string; // Company Name

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
        validate: {
            isEmail: true,
        },
    })
    declare companyEmail: string; // Company Email
}

export default Company;

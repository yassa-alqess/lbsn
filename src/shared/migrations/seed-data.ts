import DatabaseManager from "../../config/database/db-manager";
import User from "../models/user";
import Role from "../models/role";
import { RoleEnum } from "../enums"; // Adjust the path to your enums
import logger from '../../config/logger'; // Adjust the path to your logger

import _ from 'lodash';
import bcrypt from 'bcrypt';

export const userRolesMigration = async () => {
    const sequelize = DatabaseManager.getSQLInstance();
    const transaction = await sequelize.transaction();
    const email = "yassa@gmail.com"; // some email

    try {
        // Seed Roles
        logger.debug('Seeding roles...');
        const existingRoles = await Role.findAll({ attributes: ['name'], transaction });
        const rolesToAdd = _.difference(Object.values(RoleEnum), existingRoles.map(role => role.name));

        for (const role of rolesToAdd) {
            await Role.create({ name: role }, { transaction });
            logger.info(`Role ${role} added to the database.`);
        }

        // Seed User
        logger.debug('Seeding user...');
        let user = await User.findOne({ where: { email }, transaction });

        if (!user) {
            user = await User.create({
                email,
                name: "Yassa",
                companyName: "MGIL",
                phone: "123456789",
                location: "Cairo",
                password: bcrypt.hashSync("123456", 10)
            }, { transaction });
            logger.info(`User ${user.email} created.`);
        } else {
            logger.info(`User ${user.email} already exists.`);
        }

        // Find the roles
        const roles = await Role.findAll({
            where: {
                name: [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]
            },
            transaction
        });

        // Set the roles for the user
        await user.$set('roles', roles, { transaction });

        await transaction.commit();
        logger.debug('Migration and seeding completed successfully.');

        //eslint-disable-next-line
    } catch (error: any) {
        logger.error('Error during migration and seeding:', error.message);
        await transaction.rollback();
        throw error; // Rethrow the error for higher-level handling/logging
    }
};

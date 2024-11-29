import DatabaseManager from "../../config/database/db-manager";
import User from "../models/user";
import Role from "../models/role";
import { RoleEnum } from "../enums"; // Adjust the path to your enums
import logger from '../../config/logger'; // Adjust the path to your logger
import { MAIN_MAIL, PASSWORD } from "../constants";

import _ from 'lodash';
import bcrypt from 'bcrypt';

export const userRolesMigration = async () => {
    const sequelize = DatabaseManager.getSQLInstance();
    const transaction = await sequelize.transaction();
    const email = MAIN_MAIL;

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
        let user = await User.findOne({ where: { companyEmail: email }, transaction });

        if (!user) {
            user = await User.create({
                username: "leadbull",
                companyName: "leadbull",
                companyEmail: email,
                companyPhone: "+201015683986",
                companyAddress: "Cairo",
                password: bcrypt.hashSync(PASSWORD as string, 10)
            }, { transaction });
            logger.info(`User ${user.companyEmail} created.`);
        } else {
            logger.info(`User ${user.companyEmail} already exists.`);
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

import { IUserAddPayload, IUserBulkAddResponse, IUserResponse, IUsersGetResponse, IUserUpdatePayload } from "./users.interface";
import User from "../../shared/models/user";
import { readXlsx } from "../../shared/utils";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IsLockedEnum, IsVerifiedEnum } from "../../shared/enums";
import sequelize from "../../config/database/sql/sql-connection";
import Role from "../../shared/models/role";
import logger from "../../config/logger";

// 3rd party dependencies
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

export default class UserService {
    public async addUser(userPayload: IUserAddPayload): Promise<IUserResponse> {
        const transaction = await sequelize.transaction(); // Start a transaction

        try {
            // Check if user already exists
            const user = await User.findOne({ where: { email: userPayload.email } });
            if (user) {
                throw new AlreadyExistsException('User', 'email', userPayload.email);
            }

            // Validate and get the roles from the database
            const roles = await Role.findAll({
                where: {
                    name: {
                        [Op.in]: userPayload.roles,
                    },
                },
            });

            if (roles.length !== userPayload.roles.length) {
                logger.error('One or more roles are invalid');
                throw new Error('One or more roles are invalid');
            }

            // Set default values for isVerified and isLocked if not provided
            const { isVerified, isLocked } = userPayload;
            if (!isVerified) userPayload.isVerified = IsVerifiedEnum.PENDING;
            if (!isLocked) userPayload.isLocked = IsLockedEnum.UNLOCKED;


            let hashedPassword;
            try {
                hashedPassword = await bcrypt.hash(userPayload.password, 10);
                //eslint-disable-next-line
            } catch (err: any) {
                logger.error(`Couldn't Hash The Password, ${err.message}`);
                throw new Error(`Couldn't Hash The Password`);
            }
            // Create the user
            const newUser = await User.create({ ...userPayload, isVerified, isLocked, password: hashedPassword }, { transaction });

            // Associate user with roles
            await newUser.$set('roles', roles, { transaction });

            // Commit the transaction
            await transaction.commit();

            // Fetch roles to return
            const userRoles = await newUser.$get('roles');

            // return {
            //     ...newUser.toJSON(),
            //     roles: userRoles.map((role) => role.name),
            // };
            return {
                userId: newUser.userId,
                email: newUser.email,
                name: newUser.name,
                taxId: newUser.taxId,
                roles: userRoles.map((role) => role.name),
                isVerified: newUser.isVerified,
                companyName: newUser.companyName,
                phone: newUser.phone,
                location: newUser.location,
                image: newUser.image,
                isLocked: newUser.isLocked,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback(); // Rollback in case of error
            logger.error(`Couldn't Add User, ${error.message}`);
            throw new Error(`Couldn't Add User`);
        }
    }

    public async updateUser(userPayload: IUserUpdatePayload): Promise<IUserResponse | undefined> {
        const { userId, roles: newRoles, email, taxId, password } = userPayload;
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'roles' }],
        });
        if (!user) {
            throw new NotFoundException('User', 'userId', userId);
        }

        const transaction = await sequelize.transaction(); // Start a transaction

        try {
            // Hash password if it’s provided and different from the current one
            if (password && !(await bcrypt.compare(password, user.password))) {
                userPayload.password = await bcrypt.hash(password, 10);
            } else {
                delete userPayload.password;
            }


            // Check for unique email and taxId to avoid constraint violation
            const existingUserWithEmail = await User.findOne({
                where: {
                    email: email,
                    userId: { [Op.ne]: userId }, // Exclude the current user from the check
                },
                transaction,
            });
            if (existingUserWithEmail) {
                throw new AlreadyExistsException('User', 'email', email as string);
            }

            // Check for unique taxId if it's provided
            if (taxId) {
                const existingUserWithTaxId = await User.findOne({
                    where: {
                        taxId: taxId,
                        userId: { [Op.ne]: userId }, // Exclude the current user from the check
                    },
                    transaction,
                });
                if (existingUserWithTaxId) {
                    throw new AlreadyExistsException('User', 'taxId', taxId as string);
                }
            }

            // Update user if there are changes
            if (Object.keys(userPayload).length > 0) {
                await user.update(userPayload, { transaction });
            }

            // Update roles if provided
            if (newRoles) {
                const roles = await Role.findAll({
                    where: { name: { [Op.in]: newRoles } },
                    transaction,
                });

                if (roles.length !== newRoles.length) {
                    throw new Error('One or more roles are invalid');
                }

                await user.$set('roles', roles, { transaction });
            }

            await transaction.commit();

            const updatedRoles = await user.$get('roles');

            return {
                userId: user.userId,
                email: user.email,
                name: user.name,
                taxId: user.taxId,
                roles: updatedRoles.map((role) => role.name),
                isVerified: user.isVerified,
                companyName: user.companyName,
                phone: user.phone,
                location: user.location,
                image: user.image,
                isLocked: user.isLocked,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback();
            logger.error(`Couldn't Update User, ${error.message}`);
            throw new Error(`Couldn't Update User`);
        }
    }

    public async bulkAddUsers(filePath: string): Promise<IUserBulkAddResponse | undefined> {

        let data;
        try {
            data = readXlsx(filePath);
            //eslint-disable-next-line
        } catch (error: any) {
            throw new Error(`Failed to read the Excel file: ${error.message}`);

        }

        const users = [];
        const rolesToAssign = new Map<string, string[]>();

        for (const user of data) {

            const definedUser = user as { email: string, name: string, taxId: string, roles: string, isVerified: IsVerifiedEnum, companyName: string, phone: string, location: string, image: string, isLocked: IsLockedEnum };

            if (User.findOne({ where: { email: definedUser.email } }) !== null) {
                logger.info(`User with email ${definedUser.email} already exists`);
                continue; // Skip if the user already exists
            }
            const roles = (definedUser.roles || "").split(",").map(role => role.trim());
            rolesToAssign.set(definedUser.email, roles); // Store roles by user email

            users.push({
                email: definedUser.email,
                name: definedUser.name,
                taxId: definedUser.taxId,
                isVerified: definedUser.isVerified,
                companyName: definedUser.companyName,
                phone: definedUser.phone,
                location: definedUser.location,
                image: definedUser.image,
                isLocked: definedUser.isLocked,
            });
        }


        let usersResponse;
        try {
            usersResponse = await User.bulkCreate(users);
            //eslint-disable-next-line
        } catch (error: any) {
            throw new Error(`Failed to bulk add users: ${error.message}`);
        }
        logger.debug(`Bulk added ${usersResponse.length} users`);
        // Associate roles with users
        const roleNames = new Set<string>();
        rolesToAssign.forEach(roles => roles.forEach(role => roleNames.add(role)));

        let roles;
        try {
            roles = await Role.findAll({
                where: { name: { [Op.in]: roleNames } }
            });
            //eslint-disable-next-line
        } catch (error: any) {
            throw new Error(`Failed to fetch roles: ${error.message}`);
        }

        const roleMap = new Map<string, Role>(roles.map(role => [role.name, role])); // Map role names to Role instances


        try {
            for (const user of usersResponse) {
                logger.debug(`Assigning roles to user with email ${user.email}`);
                const userRoles = rolesToAssign.get(user.email) || [];
                // Map role names to Role instances
                // Ensure validRoles contains only Role instances
                const validRoles = userRoles.map(roleName => roleMap.get(roleName))
                    .filter((role): role is Role => role !== undefined);

                // Associate roles with user
                await user.$set('roles', validRoles);
            }
            //eslint-disable-next-line
        } catch (error: any) {
            throw new Error(`Failed to assign roles: ${error.message}`);
        }

        logger.info(`Bulk added ${usersResponse.length} users`);
        // Prepare response
        return {
            users: usersResponse.map(user => ({

                userId: user.userId,
                email: user.email,
                name: user.name,
                taxId: user.taxId,
                roles: user.roles.map((role) => role.name),
                isVerified: user.isVerified,
                companyName: user.companyName,
                phone: user.phone,
                location: user.location,
                image: user.image,
                isLocked: user.isLocked,
            }))
        };


    }

    public async getUser(userId: string): Promise<IUserResponse | undefined> {
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'roles' }], // Include roles
        });
        if (!user) {
            throw new NotFoundException('User', 'userId', userId);
        }
        return {
            userId: user.userId,
            email: user.email,
            name: user.name,
            taxId: user.taxId,
            roles: user.roles.map((role) => role.name), // Extract role names
            isVerified: user.isVerified,
            companyName: user.companyName,
            phone: user.phone,
            location: user.location,
            image: user.image,
            isLocked: user.isLocked,
        };
    }

    public async getUserByEmail(email: string): Promise<IUserResponse | undefined> {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: 'roles' }], // Include roles
        });
        if (!user) {
            throw new NotFoundException('User', 'email', email);
        }
        return {
            userId: user.userId,
            email: user.email,
            name: user.name,
            taxId: user.taxId,
            roles: user.roles.map((role) => role.name),
            isVerified: user.isVerified,
            companyName: user.companyName,
            phone: user.phone,
            location: user.location,
            image: user.image,
            isLocked: user.isLocked,
        };
    }

    public async getUsers(): Promise<IUsersGetResponse | undefined> {
        const users = await User.findAll({
            include: [{ model: Role, as: 'roles' }], // Include roles
        });
        return {
            users: users.map(user => ({
                userId: user.userId,
                email: user.email,
                name: user.name,
                taxId: user.taxId,
                roles: user.roles.map((role) => role.name),
                isVerified: user.isVerified,
                companyName: user.companyName,
                phone: user.phone,
                location: user.location,
                image: user.image,
                isLocked: user.isLocked,
            })),
        };
    }

    public async deleteUser(userId: string): Promise<void> {
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'roles' }], // Include roles to handle associations
        });
        if (!user) {
            throw new NotFoundException('User', 'userId', userId);
        }

        // Remove associations with roles
        await user.$set('roles', []);

        // Delete the user
        try {

            await user.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Couldn't Delete User, ${error.message}`);
            throw new Error(`Couldn't Delete User`);
        }
    }

}
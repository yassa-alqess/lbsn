import { IUserAddPayload, IUserBulkAddResponse, IUserResponse, IUsersGetResponse, IUserUpdatePayload } from "./users.interface";
import User from "../../shared/models/user";
import { readXlsx } from "../../shared/utils";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IsLockedEnum, IsVerifiedEnum } from "../../shared/enums";
import Role from "../../shared/models/role";
import logger from "../../config/logger";
import DatabaseManager from "../../config/database/db-manager";

// 3rd party dependencies
import bcrypt from 'bcrypt';
import { Op, Sequelize } from 'sequelize';

export default class UserService {

    private _sequelize: Sequelize | null = null;
    constructor() {
        this._sequelize = DatabaseManager.getSQLInstance();
    }
    public async addUser(userPayload: IUserAddPayload): Promise<IUserResponse> {
        const transaction = await this._sequelize!.transaction(); // Start a transaction

        try {
            // Check if user already exists
            const user = await User.findOne({ where: { email: userPayload.companyEmail } });
            if (user) {
                throw new AlreadyExistsException('User', 'email', userPayload.companyEmail);
            }

            // Validate and get the roles from the database
            let roles;
            try {
                roles = await Role.findAll({
                    where: {
                        name: {
                            [Op.in]: userPayload.roles,
                        },
                    }, transaction,
                });
            } //eslint-disable-next-line
            catch (error: any) {
                logger.error(`Couldn't Fetch Roles, ${error.message}`);
                throw new Error(`Couldn't Fetch Roles`);
            }

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
                username: newUser.username,
                userEmail: newUser.userEmail,
                userPhone: newUser.userPhone,
                userAddress: newUser.userAddress,
                companyTaxId: newUser.companyTaxId,
                companyName: newUser.companyName,
                companyEmail: newUser.companyEmail,
                companyPhone: newUser.companyPhone,
                companyAddress: newUser.companyAddress,
                roles: userRoles.map((role) => role.name),
                image: newUser.image,
                isVerified: newUser.isVerified,
                isLocked: newUser.isLocked,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Couldn't Add User, ${error.message}`);
            await transaction.rollback(); // Rollback in case of error
            throw new Error(`Couldn't Add User, ${error.message}`);
        }
    }

    public async updateUser(userPayload: IUserUpdatePayload): Promise<IUserResponse | undefined> {
        const { userId, companyTaxId, companyEmail, password, roles: newRoles, } = userPayload;
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'roles' }],
        });
        if (!user) {
            throw new NotFoundException('User', 'userId', userId);
        }

        const transaction = await this._sequelize!.transaction(); // Start a transaction

        try {
            // Hash password if it’s provided and different from the current one
            if (password && !(await bcrypt.compare(password, user.password))) {
                userPayload.password = await bcrypt.hash(password, 10);
            } else {
                delete userPayload.password;
            }

            // Check for unique email and taxId to avoid constraint violation
            if (companyEmail) {
                const existingUserWithEmail = await User.findOne({
                    where: {
                        companyEmail,
                        userId: { [Op.ne]: userId }, // Exclude the current user from the check
                    },
                    transaction,
                });
                if (existingUserWithEmail) {
                    throw new AlreadyExistsException('User', 'email', companyEmail as string);
                }
            }

            if (companyTaxId) {
                const existingUserWithTaxId = await User.findOne({
                    where: {
                        companyTaxId,
                        userId: { [Op.ne]: userId }, // Exclude the current user from the check
                    },
                    transaction,
                });
                if (existingUserWithTaxId) {
                    throw new AlreadyExistsException('User', 'taxId', companyTaxId as string);
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
                username: user.username,
                userEmail: user.userEmail,
                userPhone: user.userPhone,
                userAddress: user.userAddress,
                companyTaxId: user.companyTaxId,
                companyName: user.companyName,
                companyEmail: user.companyEmail,
                companyPhone: user.companyPhone,
                companyAddress: user.companyAddress,
                roles: updatedRoles.map((role) => role.name),
                image: user.image,
                isVerified: user.isVerified,
                isLocked: user.isLocked
            };
            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback();
            logger.error(`Couldn't Update User, ${error.message}`);
            throw new Error(`Couldn't Update User, ${error.message}`);
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

            const definedUser = user as { username: string, userEmail: string, userPhone: string, userAddress: string, companytaxId: string, companyName: string, companyEmail: string, companyPhone: string, companyAddress: string, roles: string, isVerified: IsVerifiedEnum, isLocked: IsLockedEnum };

            if (User.findOne({ where: { email: definedUser.companyEmail } }) !== null) {
                logger.info(`User with email ${definedUser.companyEmail} already exists`);
                continue; // Skip if the user already exists
            }
            const roles = (definedUser.roles || "").split(",").map(role => role.trim());
            rolesToAssign.set(definedUser.companyEmail, roles); // Store roles by user email

            users.push({
                username: definedUser.username,
                userEmail: definedUser.userEmail,
                userPhone: definedUser.userPhone,
                userAddress: definedUser.userAddress,
                companytaxId: definedUser.companytaxId,
                companyName: definedUser.companyName,
                companyEmail: definedUser.companyEmail,
                companyPhone: definedUser.companyPhone,
                companyAddress: definedUser.companyAddress,
                isVerified: definedUser.isVerified,
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
                logger.debug(`Assigning roles to user with email ${user.companyEmail}`);
                const userRoles = rolesToAssign.get(user.companyEmail) || [];
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
                username: user.username,
                userEmail: user.userEmail,
                userPhone: user.userPhone,
                userAddress: user.userAddress,
                companyTaxId: user.companyTaxId,
                companyName: user.companyName,
                companyEmail: user.companyEmail,
                companyPhone: user.companyPhone,
                companyAddress: user.companyAddress,
                roles: user.roles.map((role) => role.name),
                image: user.image,
                isVerified: user.isVerified,
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
            username: user.username,
            userEmail: user.userEmail,
            userPhone: user.userPhone,
            userAddress: user.userAddress,
            companyTaxId: user.companyTaxId,
            companyName: user.companyName,
            companyEmail: user.companyEmail,
            companyPhone: user.companyPhone,
            companyAddress: user.companyAddress,
            roles: user.roles.map((role) => role.name), // extract role names
            image: user.image,
            isVerified: user.isVerified,
            isLocked: user.isLocked,
        };
    }

    public async getUserByEmail(email: string): Promise<IUserResponse | undefined> {
        const user = await User.findOne({
            where: { companyEmail: email },
            include: [{ model: Role, as: 'roles' }], // Include roles
        });
        if (!user) {
            throw new NotFoundException('User', 'email', email);
        }
        return {
            userId: user.userId,
            username: user.username,
            userEmail: user.userEmail,
            userPhone: user.userPhone,
            userAddress: user.userAddress,
            companyTaxId: user.companyTaxId,
            companyName: user.companyName,
            companyEmail: user.companyEmail,
            companyPhone: user.companyPhone,
            companyAddress: user.companyAddress,
            roles: user.roles.map((role) => role.name), // extract role names
            image: user.image,
            isVerified: user.isVerified,
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
                username: user.username,
                userEmail: user.userEmail,
                userPhone: user.userPhone,
                userAddress: user.userAddress,
                companyTaxId: user.companyTaxId,
                companyName: user.companyName,
                companyEmail: user.companyEmail,
                companyPhone: user.companyPhone,
                companyAddress: user.companyAddress,
                roles: user.roles.map((role) => role.name), // extract role names
                image: user.image,
                isVerified: user.isVerified,
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
            throw new Error(`Couldn't Delete User, ${error.message}`);
        }
    }
}
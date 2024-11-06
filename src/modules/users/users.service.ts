import { IUserAddPayload, IUserBulkAddResponse, IUserResponse, IUsersGetPayload, IUsersGetResponse, IUserUpdatePayload } from "./users.interface";
import User from "../../shared/models/user";
import { deleteFile, getFileSizeAsync, readXlsx } from "../../shared/utils";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IsLockedEnum, IsResolvedEnum, IsVerifiedEnum, MarketingBudgetEnum, RoleEnum } from "../../shared/enums";
import Role from "../../shared/models/role";
import logger from "../../config/logger";
import DatabaseManager from "../../config/database/db-manager";
import { USER_IMAGES_PATH } from "../../shared/constants";
import { IgetGuestRequestsResponse, IGuestRequest } from "../guest-requests/guest-requests.interface";
import GuestRequest from "../../shared/models/guest-request";
import Service from "../../shared/models/service";

// 3rd party dependencies
import bcrypt from 'bcrypt';
import { Op, Sequelize, Transaction } from 'sequelize';
import path from 'path';

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

            // Create the user & assign role USER to it
            const newUser = await User.create({ ...userPayload, isVerified, isLocked, password: hashedPassword }, { transaction });

            const role = await Role.findOne({ where: { name: RoleEnum.USER } });
            if (!role) {
                throw new NotFoundException('Role', 'name', RoleEnum.USER);
            }
            await newUser.$add('roles', role, { transaction });

            // Commit the transaction
            await transaction.commit();

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
                image: newUser.image ? newUser.image : '',
                size: newUser.image ? await getFileSizeAsync(path.join(USER_IMAGES_PATH, newUser.image)) : '0KB',
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
        const { userId, password } = userPayload;
        let user = await this._findUserById(userId);

        const transaction = await this._sequelize!.transaction(); // Start a transaction

        try {
            if (password) {
                await this._handlePasswordUpdate(userPayload, password, user.password);
            }

            await this._checkUniqueFields(userPayload, userId, transaction);

            await this._handleImageUpdate(userPayload, user);

            user = await this._updateUserPayload(userPayload, user, transaction);

            await transaction.commit();

            return this._buildUserResponse(user);

            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback();
            logger.error(`Couldn't Update User, ${error.message}`);
            throw new Error(`Couldn't Update User, ${error.message}`);
        }
    }

    private async _findUserById(userId: string): Promise<User> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFoundException('User', 'userId', userId);
        }
        return user;
    }

    private async _handlePasswordUpdate(userPayload: IUserUpdatePayload, newPassword: string, currentPassword: string): Promise<void> {
        if (!(await bcrypt.compare(newPassword, currentPassword))) {
            userPayload.password = await bcrypt.hash(newPassword, 10);
        } else {
            delete userPayload.password; // Remove the password field if it hasn't changed
        }
    }

    private async _checkUniqueFields(userPayload: IUserUpdatePayload, userId: string, transaction: Transaction): Promise<void> {
        const { companyEmail, companyTaxId } = userPayload;

        if (companyEmail) {
            const existingUserWithEmail = await User.findOne({
                where: {
                    companyEmail,
                    userId: { [Op.ne]: userId }
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
                    userId: { [Op.ne]: userId }
                },
                transaction,
            });
            if (existingUserWithTaxId) {
                throw new AlreadyExistsException('User', 'taxId', companyTaxId as string);
            }
        }
    }

    private async _handleImageUpdate(userPayload: IUserUpdatePayload, user: User): Promise<void> {
        const oldImage = user.image;
        const newImage = userPayload.image;

        if (newImage && oldImage !== newImage) {
            deleteFile(path.join(USER_IMAGES_PATH, oldImage));
        }

        if (!newImage) {
            delete userPayload.image;
        }
    }

    private async _updateUserPayload(userPayload: IUserUpdatePayload, user: User, transaction: Transaction): Promise<User> {
        if (Object.keys(userPayload).length > 0) {
            user = await user.update(userPayload, { transaction });
        }
        return user;
    }

    private async _buildUserResponse(user: User): Promise<IUserResponse> {
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
            image: user.image ? user.image : '',
            size: user.image ? await getFileSizeAsync(path.join(USER_IMAGES_PATH, user.image)) : '0KB',
            isVerified: user.isVerified,
            isLocked: user.isLocked,
        };
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
            include: [{ model: Role, as: 'roles' }],
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
            image: user.image ? user.image : '',
            size: user.image ? await getFileSizeAsync(path.join(USER_IMAGES_PATH, user.image)) : '0KB',
            roles: user.roles.map((role) => role.name),
            isVerified: user.isVerified,
            isLocked: user.isLocked,
        };
    }

    public async getUserByEmail(email: string): Promise<IUserResponse | undefined> {
        const user = await User.findOne({
            where: { companyEmail: email },
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
            image: user.image ? user.image : '',
            size: user.image ? await getFileSizeAsync(path.join(USER_IMAGES_PATH, user.image)) : '0KB',
            isVerified: user.isVerified,
            isLocked: user.isLocked,
        };
    }

    public async getUsers(usersGetPayload: IUsersGetPayload): Promise<IUsersGetResponse | undefined> {
        const { limit, offset } = usersGetPayload;
        const { rows: users, count } = await User.findAndCountAll({
            include: [{
                model: Role,
                as: 'roles',
                where: { name: RoleEnum.USER },
                through: {
                    attributes: []
                }
            }],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
        return {
            users: users.map((user) => ({
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
                image: user.image ? user.image : '',
                isVerified: user.isVerified,
                isLocked: user.isLocked,
            })),
            total: count,
            pages: Math.ceil(count / (limit || 10)),
        };
    }

    public async getUserRequests(userId: string): Promise<IgetGuestRequestsResponse | undefined> {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new NotFoundException('User', 'userId', userId);
            }
            const guestRequests = await GuestRequest.findAll({
                where: { guestId: user?.guestId },
                include: [{
                    model: Service,
                    attributes: ['serviceId', 'name'],
                }],
            });

            const guestRequestsResponse: IGuestRequest[] = guestRequests.map(request => ({
                // ...request.toJSON() as IGuestRequest,
                requestId: request.guestRequestId,
                guestId: request.guestId,
                serviceId: request.serviceId,
                categoryId: request.categoryId,
                status: request.resolved as IsResolvedEnum,
                marketingBudget: request.marketingBudget as MarketingBudgetEnum
            }));

            return { gestRequests: guestRequestsResponse };
        }

        //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Couldn't get guest requests, ${error.message}`);
            throw new Error(`Couldn't get guest requests, ${error.message}`);
        }
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
            if (user.image) {
                deleteFile(path.join(USER_IMAGES_PATH, user.image));
            }
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Couldn't Delete User, ${error.message}`);
            throw new Error(`Couldn't Delete User, ${error.message}`);
        }
    }
}
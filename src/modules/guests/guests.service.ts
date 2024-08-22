import { ApproveGuestResponse, IGuestAddPayload, IGuestResponse, IGuestsGetResponse, IGuestUpdatePayload } from "./guests.interface";
import { IUserAddPayload } from "../users/users.interface";
import { IEmailOptions } from "../../config/mailer/email.interface";
import { generateRandomPassword } from "../../shared/utils";
import Guest from "../../shared/models/guest";
import { IsApprovedEnum, IsVerifiedEnum, RoleEnum } from "../../shared/enums";
import UserService from "../users/users.service";
import Role from "../../shared/models/role";
import User from "../../shared/models/user";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";
import DatabaseManager from "../../config/database/db-manager";

//3rd party dependencies
import bcrypt from 'bcrypt';
import { Sequelize, Transaction } from "sequelize";

export default class GuestService {
    private _userService = new UserService();
    private _sequelize: Sequelize | null = null;
    constructor() {
        this._sequelize = DatabaseManager.getSQLInstance();
    }
    public async addGuest(guestPayload: IGuestAddPayload): Promise<IGuestResponse> {
        const guest = await Guest.findOne({ where: { email: guestPayload.email } });
        if (guest)
            throw new AlreadyExistsException('Guest', 'email', guestPayload.email);

        try {
            const newGuest = await Guest.create({ ...guestPayload, approved: IsApprovedEnum.PENDING });
            return {
                ...newGuest.toJSON() as IGuestResponse
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding guest: ${error.message}`);
            throw new Error(`Error adding guest`);
        }
    }

    public async updateGuest(guestPayload: IGuestUpdatePayload): Promise<IGuestResponse | undefined> {
        const { guestId } = guestPayload;
        const guest = await Guest.findByPk(guestId);
        if (!guest)
            throw new NotFoundException('Guest', 'guestId', guestId);
        try {
            await guest.update({ ...guestPayload });
            return {
                ...guest.toJSON() as IGuestResponse
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating guest: ${error.message}`);
            throw new Error(`Error updating guest`);
        }

    }

    public async getGuest(guestId: string): Promise<IGuestResponse | undefined> {
        const guest = await Guest.findByPk(guestId);
        if (!guest)
            throw new NotFoundException('Guest', 'guestId', guestId);

        return {
            ...guest.toJSON() as IGuestResponse
        };
    }

    public async getGuests(): Promise<IGuestsGetResponse | undefined> {
        const guests = await Guest.findAll();
        return {
            guests:
                guests.map(guest => ({
                    ...guest.toJSON() as IGuestResponse,
                }))
        }
    }

    public async deleteGuest(guestId: string, txn?: Transaction | null): Promise<void> {
        const transaction = txn || await this._sequelize!.transaction();

        try {
            // Find the guest
            const guest = await Guest.findByPk(guestId, { transaction });
            if (!guest) {
                throw new NotFoundException('Guest', 'guestId', guestId);
            }

            // Delete all guest requests for this guest
            // await this._guestRequestsService.deleteAllGuestRequests(guestId, transaction);
            await guest.$set('services', [], { transaction });

            await guest.$set('appointments', [], { transaction });

            // Delete the guest
            await guest.destroy({ transaction });

            // Commit the transaction if it was created within this method
            if (!txn) {
                await transaction.commit();
            }
            //eslint-disable-next-line
        } catch (error: any) {
            // Rollback the transaction if it was created within this method
            if (!txn) {
                await transaction.rollback();
            }
            logger.error(`Error deleting guest & it's requests: ${error.message}`);
            throw new Error(`Error deleting guest & it's requests`);
        }
    }

    public async approveGuest(guestId: string, txn?: Transaction): Promise<ApproveGuestResponse> {
        const transaction = txn || await this._sequelize!.transaction();

        try {
            const guest = await Guest.findByPk(guestId, { transaction });
            if (!guest) {
                throw new NotFoundException('Guest', 'guestId', guestId);
            }

            let sendEmail = false;

            // Check if the guest is already approved
            if (guest.approved === IsApprovedEnum.APPROVED) {
                try {
                    const existingUser = await this._userService.getUserByEmail(guest.email);
                    if (existingUser) {
                        logger.info('Guest already approved and user exists');
                        return { userId: existingUser.userId, email: guest.email, sendEmail: false };
                    }
                    //eslint-disable-next-line
                } catch (error: any) {
                    if (error instanceof NotFoundException) {
                        logger.info('Guest approved, but no corresponding user found, proceeding to create a new user');
                    } else {
                        logger.error(`Error getting user: ${error.message}`);
                        throw new Error(`Error Adding User`);
                    }
                }
            }

            const email = guest.email;
            try {
                const existingUser = await this._userService.getUserByEmail(email);
                if (existingUser) {
                    logger.info('User already exists');
                    return { userId: existingUser.userId, email: guest.email, sendEmail: false };
                }
                //eslint-disable-next-line
            } catch (error: any) {
                if (error instanceof NotFoundException) {
                    logger.info('User does not exist');
                } else {
                    logger.error(`Error getting user: ${error.message}`);
                    throw new Error(`Error Adding User`);
                }
            }

            // Generate random password
            const password = generateRandomPassword();
            const hashedPassword = bcrypt.hashSync(password, 10);

            const userPayload: IUserAddPayload = {
                email,
                name: guest.name,
                taxId: guest.taxId,
                companyName: guest.companyName,
                phone: guest.phone,
                location: guest.location,
                password: hashedPassword,
                isVerified: IsVerifiedEnum.PENDING,
                roles: [RoleEnum.USER],
            };

            const newUser = await User.create({ ...userPayload }, { transaction });
            logger.debug(`New user created: ${newUser.userId}`);
            const role = await Role.findOne({ where: { name: RoleEnum.USER }, transaction });

            await newUser.$set('roles', [role as Role], { transaction });

            // Prepare the email payload to be sent later
            sendEmail = true;
            const emailPayload: IEmailOptions = {
                to: email,
                subject: 'Account approved',
                template: 'approve-guest',
                context: { email, password },
            };

            // Mark guest as approved
            await guest.update({ approved: IsApprovedEnum.APPROVED }, { transaction });

            if (!txn) await transaction.commit();
            return { userId: newUser.userId, email: guest.email, sendEmail, emailPayload };
            //eslint-disable-next-line
        } catch (error: any) {
            if (!txn) await transaction.rollback();
            logger.error(`Error approving guest: ${error.message}`);
            throw new Error(`Error approving guest`);
        }
    }

    public async getGuestByEmail(email: string): Promise<IGuestResponse | undefined> {
        const guest = await Guest.findOne({ where: { email } });
        if (!guest) {
            throw new NotFoundException('Guest', 'email', email);
        }
        return {
            guestId: guest.guestId,
            email: guest.email,
            name: guest.name,
            taxId: guest.taxId,
            companyName: guest.companyName,
            phone: guest.phone,
            location: guest.location,
            approved: guest.approved
        };
    }
}
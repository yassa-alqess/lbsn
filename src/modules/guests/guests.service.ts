import { IGuestAddPayload, IGuestResponse, IGuestsGetResponse, IGuestUpdatePayload } from "./guests.interface";
import { IUserAddPayload } from "../users/users.interface";
import { IEmailOptions } from "../../config/mailer/email.interface";
import generateRandomPassword from "../../shared/utils/random-password";
import Guest from "../../shared/models/guest";
import { IsVerifiedEnum, RoleEnum } from "../../shared/enums";
import UserService from "../users/users.service";
import EmailService from "../../config/mailer";
import { GuestNotFoundError, GuestAlreadyApprovedError, UserAlreadyExistsError, GuestAlreadyExistsError } from "../../shared/errors";
import Role from "../../shared/models/role";
import User from "../../shared/models/user";
// import UserRole from "@/shared/models/user-role";

//3rd party dependencies
import bcrypt from 'bcrypt';

export default class GuestService {
    private _userService = new UserService();
    private _emailService = new EmailService();
    public async addGuest(guestPayload: IGuestAddPayload): Promise<IGuestResponse> {

        const guest = await Guest.findOne({ where: { email: guestPayload.email } });
        if (guest)
            throw new GuestAlreadyExistsError('Guest already exist');

        const newGuest = await Guest.create({ ...guestPayload });
        return {
            guestId: newGuest.guestId,
            email: newGuest.email,
            name: newGuest.name,
            taxId: newGuest.taxId,
            companyName: newGuest.companyName,
            phone: newGuest.phone,
            location: newGuest.location,
        };
    }

    public async updateGuest(guestPayload: IGuestUpdatePayload): Promise<IGuestResponse> {
        const { guestId } = guestPayload;
        const guest = await Guest.findByPk(guestId);
        if (!guest)
            throw new GuestNotFoundError('Guest not found');

        await guest.update({ ...guestPayload });
        return {
            guestId: guest.guestId,
            email: guest.email,
            name: guest.name,
            taxId: guest.taxId,
            companyName: guest.companyName,
            phone: guest.phone,
            location: guest.location,
        };
    }
    public async getGuest(guestId: string): Promise<IGuestResponse> {
        const guest = await Guest.findByPk(guestId);
        if (!guest)
            throw new GuestNotFoundError('Guest not found');

        return {
            guestId: guest.guestId,
            email: guest.email,
            name: guest.name,
            taxId: guest.taxId,
            companyName: guest.companyName,
            phone: guest.phone,
            location: guest.location,
        };
    }

    public async getGuests(): Promise<IGuestsGetResponse> {
        const guests = await Guest.findAll();
        return {
            guests:
                guests.map(guest => ({
                    guestId: guest.guestId,
                    email: guest.email,
                    name: guest.name,
                    taxId: guest.taxId,
                    companyName: guest.companyName,
                    phone: guest.phone,
                    location: guest.location,
                }))
        }
    }

    public async deleteGuest(guestId: string): Promise<void> {
        const guest = await Guest.findByPk(guestId);
        if (!guest) {
            throw new GuestNotFoundError('Guest not found');
        }
        await guest.destroy();
    }

    public async approveGuest(guestId: string): Promise<string> {
        const guest = await Guest.findByPk(guestId);
        if (!guest)
            throw new GuestNotFoundError('Guest not found');

        if (guest.approved)
            throw new GuestAlreadyApprovedError('Guest already approved');

        const email = guest.email;
        const user = await this._userService.getUserByEmail(email);
        if (user)  // user may request another service later so we make sure to not add him again
            throw new UserAlreadyExistsError('User already exist');

        // generate random password
        const password = generateRandomPassword();
        const hashedPassword = bcrypt.hashSync(password, 10);
        const emailPayload: IEmailOptions = {
            to: [email],
            subject: 'Account approved',
            template: 'approve-guest',
            context: { email, password }
        };

        await this._emailService.sendEmail(emailPayload); //email errors are delegated to email service

        // add user with role 2
        const userPayload: IUserAddPayload = {
            email,
            name: guest.name,
            taxId: guest.taxId,
            companyName: guest.companyName,
            phone: guest.phone,
            location: guest.location,
            password: hashedPassword,
            isVerified: IsVerifiedEnum.PENDING,
        };
        // const newUser = await this._userService.addUser(userPayload);
        const newUser = await User.create({ ...userPayload });
        const role = await Role.findOne({ where: { name: RoleEnum.USER } });
        if (!role)
            throw new Error('Role User not found');

        newUser.roles.push(role);
        await newUser.save();

        // await UserRole.create({ userId: newUser.userId, roleId: role.roleId });


        /**
         *  we can't delete the guest as he may have requested other services, instead we mark him as approved to indecate he is already a user
         *   as even if ensure that he already get added once to guest table, we can't ensure that he didn't request another service
         *   deleting him will cause a problem if he requested another service (reference to null at guest-services table)
        */
        await guest.update({ approved: true });
        await guest.save();
        return newUser.userId;
    }

    public async getGuestByEmail(email: string): Promise<IGuestResponse> {
        const guest = await Guest.findOne({ where: { email } });
        if (!guest) {
            throw new Error('Guest not found');
        }
        return {
            guestId: guest.guestId,
            email: guest.email,
            name: guest.name,
            taxId: guest.taxId,
            companyName: guest.companyName,
            phone: guest.phone,
            location: guest.location,
        };
    }
}
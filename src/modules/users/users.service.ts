import { IUserAddPayload, IUserBulkAddResponse, IUserResponse, IUsersGetResponse, IUserUpdatePayload } from "./user.interface";
import User from "../../shared/models/user";
import { readXlsx } from "../../shared/utils";

export default class UserService {
    public async addUser(userPayload: IUserAddPayload): Promise<IUserResponse> {
        const user = await User.create({ ...userPayload });
        return {
            userId: user.userId,
            email: user.email,
            displayName: user.displayName,
            taxId: user.taxId,
            role: user.role,
            isVerified: user.isVerified,
            companyName: user.companyName,
            phone: user.phone,
            location: user.location,
            image: user.image,
            password: user.password,
            isLocked: user.isLocked,
        };
    }

    public async updateUser(userPayload: IUserUpdatePayload): Promise<IUserResponse> {
        const { userId } = userPayload;
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await user.update({ ...userPayload });
        return {
            userId: user.userId,
            email: user.email,
            displayName: user.displayName,
            taxId: user.taxId,
            role: user.role,
            isVerified: user.isVerified,
            companyName: user.companyName,
            phone: user.phone,
            location: user.location,
            image: user.image,
            password: user.password,
            isLocked: user.isLocked,
        };
    }

    public async bulkAddUsers(filePath: string, role: number): Promise<IUserBulkAddResponse> {

        const data = readXlsx(filePath);
        //eslint-disable-next-line
        const users = data.map((user: any) => {
            return {
                email: user.email,
                displayName: user.displayName,
                taxId: user.taxId,
                role,
                isVerified: user.isVerified,
                companyName: user.companyName,
                phone: user.phone,
                location: user.location,
                image: user.image,
                password: user.password,
                isLocked: user.isLocked,
            }
        });

        const usersResponse = await User.bulkCreate(users);
        return {
            users:
                usersResponse.map((user) => {
                    return {
                        userId: user.userId,
                        email: user.email,
                        displayName: user.displayName,
                        taxId: user.taxId,
                        role: user.role,
                        isVerified: user.isVerified,
                        companyName: user.companyName,
                        phone: user.phone,
                        location: user.location,
                        image: user.image,
                        password: user.password,
                        isLocked: user.isLocked,
                    }
                })
        };
    }

    public async getUser(userId: string): Promise<IUserResponse> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return {
            userId: user.userId,
            email: user.email,
            displayName: user.displayName,
            taxId: user.taxId,
            role: user.role,
            isVerified: user.isVerified,
            companyName: user.companyName,
            phone: user.phone,
            location: user.location,
            image: user.image,
            password: user.password,
            isLocked: user.isLocked,
        };
    }

    public async getUsers(): Promise<IUsersGetResponse> {
        const users = await User.findAll();
        return {
            users:
                users.map(user => ({
                    userId: user.userId,
                    email: user.email,
                    displayName: user.displayName,
                    taxId: user.taxId,
                    role: user.role,
                    isVerified: user.isVerified,
                    companyName: user.companyName,
                    phone: user.phone,
                    location: user.location,
                    image: user.image,
                    password: user.password,
                    isLocked: user.isLocked,
                }))
        }
    }

    public async deleteUser(userId: string): Promise<void> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await user.destroy();
    }


}
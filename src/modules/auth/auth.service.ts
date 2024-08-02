// file dependencies
import { REFRESH_TOKEN_EXPIRY } from "../../shared/constants";
import User from "../../shared/models/user";
import RefreshToken from "../../shared/models/refresh-token";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils";
import { IAuthPayload } from "./auth.interface";
import { RoleEnum } from "../../shared/enums";

//3rd party dependinces
import bcrypt from 'bcrypt'

export default class AuthService {
    public async login(email: string, password: string): Promise<string[]> {
        //get user and it's roles
        const user = await User.findOne({
            where: {
                email,
            },
            include: 'roles',
        });

        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const tokenPayload = {
            id: user.id,
            roles: user.roles.map((role) => role.name as RoleEnum),
        } as IAuthPayload;
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        await RefreshToken.create({ value: refreshToken, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY) });
        return [accessToken, refreshToken];
    }

    public async logout(token: string): Promise<void> {
        await RefreshToken.destroy({
            where: {
                value: token,
            },
        });
    }



}
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from "@/shared/constants";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from "../../shared/models/user";
import RefreshToken from "../../shared/models/refresh-token";

export default class AuthService {
    constructor() { }

    public async login(email: string, password: string): Promise<string[]> {
        const user = await User.findOne({
            where: {
                email,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const payload = {
            id: user.id,
            role: user.role,
        };
        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
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
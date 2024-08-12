// file dependencies
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../../shared/constants";
import User from "../../shared/models/user";
import RefreshToken from "../../shared/models/refresh-token";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils";
import { IAuthPayload } from "./auth.interface";
import { RoleEnum } from "../../shared/enums";
import { InvalidRefreshTokenException, NotFoundException, WrongCredentialsException } from "../../shared/exceptions";
import { initializeRedisClient } from "../../config/cache";
import logger from "../../config/logger";

//3rd party dependinces
import bcrypt from 'bcrypt'
import ms from 'ms'
import { RedisClientType } from "redis";

export default class AuthService {
    constructor(private _redisClient: RedisClientType | null = null) {
        this._initializeRedisClient();
    }
    private async _initializeRedisClient(): Promise<void> {
        this._redisClient = await initializeRedisClient();
    }
    public async login(email: string, password: string): Promise<string[]> {
        //get user and it's roles
        const user = await User.findOne({
            where: {
                email,
            },
            include: 'roles',
        });

        if (!user) {
            throw new NotFoundException('User', 'email', email);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new WrongCredentialsException();
        }

        const tokenPayload = {
            id: user.id,
            roles: user.roles.map((role) => role.name as RoleEnum),
        } as IAuthPayload;

        try {
            const accessToken = generateAccessToken(tokenPayload) as string;
            const result = await this._redisClient?.setEx(accessToken, ms(ACCESS_TOKEN_EXPIRY), 'valid');
            logger.debug(`cache result: ${result}`);


            const refreshToken = generateRefreshToken(tokenPayload) as string;
            await RefreshToken.create({ value: refreshToken, expiresAt: new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRY)) });
            return [accessToken, refreshToken];
        }
        //eslint-disable-next-line
        catch (err: any) {
            logger.error(`error in login service: ${err.message}`);
            throw new Error('couldn\'t login at the moment');
        }

    }

    public async logout(accessToken: string, refreshToken: string): Promise<void> {
        const refreshTokenValue = await RefreshToken.findOne({
            where: {
                value: refreshToken,
            },
        });

        if (!refreshTokenValue) throw new InvalidRefreshTokenException();
        try {

            await this._redisClient?.del(accessToken);
            await refreshTokenValue!.destroy();

            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`error in logout service: ${err.message}`);
            throw new Error('couldn\'t logout at the moment');
        }
    }
}
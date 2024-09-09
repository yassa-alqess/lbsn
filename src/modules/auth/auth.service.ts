// file dependencies
import { ACCESS_TOKEN_EXPIRY, OTP_EXPIRY, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from "../../shared/constants";
import User from "../../shared/models/user";
import RefreshToken from "../../shared/models/refresh-token";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils";
import { IAuthPayload } from "./auth.interface";
import { IsVerifiedEnum, RoleEnum } from "../../shared/enums";
import { InvalidRefreshTokenException, NotFoundException, ExpiredException, WrongCredentialsException } from "../../shared/exceptions";
import { initializeRedisClient } from "../../config/cache";
import logger from "../../config/logger";
import EmailService from "../../config/mailer";

//3rd party dependinces
import bcrypt from 'bcrypt'
import ms from 'ms'
import { RedisClientType } from "redis";
import jwt from 'jsonwebtoken';

export default class AuthService {
    constructor(private _redisClient: RedisClientType | null = null, private _emailService: EmailService | null = null) {
        this._initializeRedisClient();
        this._emailService = new EmailService();
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
            id: user.userId,
            roles: user.roles.map((role) => role.name as RoleEnum),
        } as IAuthPayload;
        logger.debug(tokenPayload);
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

    public async refreshToken(refreshToken: string): Promise<string[]> {
        const refreshTokenValue = await RefreshToken.findOne({
            where: {
                value: refreshToken,
            },
        });

        if (!refreshTokenValue)
            throw new InvalidRefreshTokenException();

        if (refreshTokenValue.expiresAt < new Date())
            throw new ExpiredException('refresh token');

        let userPayload: IAuthPayload;
        try {
            userPayload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET as string) as IAuthPayload;
        } //eslint-disable-next-line
        catch (err: any) {
            throw new InvalidRefreshTokenException();
        }

        try {

            // payload already has an "exp" property, so no need to add it
            const accessToken = generateAccessToken({ id: userPayload.id, roles: userPayload.roles }) as string;
            await this._redisClient?.setEx(accessToken, ms(ACCESS_TOKEN_EXPIRY), 'valid');

            const newRefreshToken = generateRefreshToken({ id: userPayload.id, roles: userPayload.roles }) as string;
            await refreshTokenValue.update({ value: newRefreshToken, expiresAt: new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRY)) });
            return [accessToken, newRefreshToken];
        }
        //eslint-disable-next-line
        catch (err: any) {
            logger.error(`error in refreshToken service: ${err.message}`);
            throw new Error('couldn\'t refresh the token');
        }
    }

    public async verifyEmail(email: string): Promise<void> {
        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User', 'email', email);
        }

        try {
            // Generate OTP and store it with the email in Redis
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const result = await this._redisClient?.setEx(`fe-otp:${otp}`, ms(OTP_EXPIRY), email); // Store OTP with email
            logger.debug(`cache result: ${result} with otp: ${otp}`);

            const mailOptions = {
                to: email,
                subject: 'Email Verification',
                template: 'verify-mail',
                context: {
                    code: otp,
                    expiry: OTP_EXPIRY,
                },
            };
            await this._emailService?.sendEmail(mailOptions);
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error in verifyEmail service: ${error.message}`);
            throw new Error('couldn\'t send the verification email');
        }
    }

    public async verifyOtp(otp: string): Promise<void> {
        // Retrieve the email from Redis using the OTP
        const email = await this._redisClient?.get(`fe-otp:${otp}`);

        if (!email) {
            throw new ExpiredException('OTP has expired or is invalid');
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException('User', 'email', email);
        }

        try {
            // Mark the user as verified
            await user.update({ isVerified: IsVerifiedEnum.VERIFIED });

            // Remove the OTP from Redis after successful verification
            await this._redisClient?.del(`fe-otp:${otp}`);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error in verifyOtp service: ${error.message}`);
            throw new Error('couldn\'t verify the OTP');
        }
    }

    public async forgetPassword(email: string): Promise<void> {
        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User', 'email', email);
        }

        try {
            // Generate OTP and store it with the email in Redis
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const result = await this._redisClient?.setEx(`fp-otp:${otp}`, ms(OTP_EXPIRY), email); // Store OTP with email
            logger.debug(`cache result: ${result} with otp: ${otp}`);

            const mailOptions = {
                to: email,
                subject: 'Password Reset',
                template: 'forget-password',
                context: {
                    code: otp,
                    expiry: OTP_EXPIRY,
                },
            };
            await this._emailService?.sendEmail(mailOptions);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error in forgetPassword service: ${error.message}`);
            throw new Error('couldn\'t send the password reset email');
        }
    }

    public async resetPassword(password: string, otp: string): Promise<void> {
        const email = await this._redisClient?.get(`fp-otp:${otp}`);

        if (!email) {
            throw new ExpiredException('OTP');
        }

        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User', 'email', email);
        }

        try {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);
            await user.update({ password: hashedPassword });

            // Remove the OTP from Redis after password reset
            await this._redisClient?.del(`fp-otp:${otp}`);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`error in resetPassword service: ${error.message}`);
            throw new Error('couldn\'t reset the password');
        }
    }
}
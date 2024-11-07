// file dependencies
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, DOMAIN, OTT_EXPIRY, OTT_SECRET, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from "../../shared/constants";
import User from "../../shared/models/user";
import RefreshToken from "../../shared/models/refresh-token";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils";
import { IAuthPayload } from "./auth.interface";
import { IsVerifiedEnum, RoleEnum } from "../../shared/enums";
import { InvalidTokenException, NotFoundException, ExpiredException, WrongCredentialsException, AlreadyUsedException, AlreadyVerifiedException } from "../../shared/exceptions";
import { initializeRedisClient } from "../../config/cache";
import logger from "../../config/logger";
import EmailService from "../../config/mailer";
import UserService from "../users/users.service";

//3rd party dependinces
import bcrypt from 'bcrypt'
import ms from 'ms'
import { RedisClientType } from "redis";
import jwt, { TokenExpiredError } from 'jsonwebtoken';

export default class AuthService {
    constructor(private _redisClient: RedisClientType | null = null, private _emailService: EmailService | null = null, private _userService: UserService | null = null) {
        this._initializeRedisClient();
        this._emailService = new EmailService();
        this._userService = new UserService();
    }
    private async _initializeRedisClient(): Promise<void> {
        this._redisClient = await initializeRedisClient();
    }
    public async login(email: string, password: string): Promise<string[]> {
        //get user and it's roles
        const user = await User.findOne({
            where: {
                companyEmail: email,
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

        try {
            const accessToken = generateAccessToken(tokenPayload) as string;
            const token = `access-token:${user.userId}:${accessToken}`;
            const result = await this._redisClient?.setEx(token, ms(ACCESS_TOKEN_EXPIRY), 'valid');
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


        try {
            const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET as string) as IAuthPayload;
            if (!decoded.id) {
                throw new InvalidTokenException('access token');
            }

            const token = `access-token:${decoded.id}:${accessToken}`;
            const isValid = await this._redisClient?.get(token);
            if (!isValid) throw new InvalidTokenException('access token');

            if (!refreshTokenValue) throw new InvalidTokenException('refresh token');

            await this._redisClient?.del(`access-token:${decoded.id}:${accessToken}`);
            await refreshTokenValue!.destroy();

            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`error in logout service: ${err.message}`);
            if (err instanceof InvalidTokenException) {
                throw err;
            }
            if (err instanceof TokenExpiredError) {
                throw new ExpiredException('access token');
            }
            throw new Error('couldn\'t logout at the moment');
        }
    }

    public async refreshToken(refreshToken: string): Promise<string[]> {

        let refreshTokenValue;
        let userPayload: IAuthPayload;
        try {
            userPayload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET as string) as IAuthPayload;

            refreshTokenValue = await RefreshToken.findOne({
                where: {
                    value: refreshToken,
                },
            });

            if (!refreshTokenValue)
                throw new InvalidTokenException('refresh token');
        } //eslint-disable-next-line
        catch (err: any) {
            if (err instanceof TokenExpiredError) {
                throw new ExpiredException('refresh token');
            }
            throw new InvalidTokenException('refresh token');
        }

        try {

            // payload already has an "exp" property, so no need to add it
            const accessToken = generateAccessToken({ id: userPayload.id, roles: userPayload.roles }) as string;
            await this._redisClient?.setEx(`access-token:${userPayload.id}:${accessToken}`, ms(ACCESS_TOKEN_EXPIRY), 'valid');

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
        try {
            const user = await this._userService?.getUserByEmail(email); //will throw an error if user not found

            if (user?.isVerified === IsVerifiedEnum.VERIFIED) {
                throw new AlreadyVerifiedException('Email');
            }

            const token = jwt.sign({ email }, OTT_SECRET, { expiresIn: ms(OTT_EXPIRY) });
            const result = await this._redisClient?.setEx(`verify-email-token:${token}`, ms(OTT_EXPIRY), email);
            logger.debug(`Cache result: ${result} with token: ${token}`);


            const mailOptions = {
                to: email,
                subject: 'Email Verification',
                template: 'verify-mail',
                context: {
                    link: `${DOMAIN}/verify-email?token=${token}`,
                    expiry: OTT_EXPIRY,
                },
            };

            await this._emailService?.sendEmail(mailOptions);
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in verifyEmail service: ${error.message}`);
            if (error instanceof NotFoundException || error instanceof AlreadyVerifiedException) {
                throw error;
            }
            throw new Error('Could not send the verification email');
        }
    }

    public async verifyEmailToken(token: string): Promise<void> {
        try {
            const decoded = jwt.verify(token, OTT_SECRET) as { email: string };
            if (!decoded.email) {
                throw new InvalidTokenException('Verify Email Token');
            }

            const email = await this._redisClient?.get(`verify-email-token:${token}`);
            logger.debug(`Email from cache: ${email}`);
            if (!email) { //token not expired and valid as no exception thrown, but it's not in cache
                throw new AlreadyUsedException('Verify Email Token');
            }

            // Ensure the email from Redis matches the one in the token
            if (email !== decoded.email) {
                throw new InvalidTokenException('Verify Email Token');
            }

            const user = await this._userService?.getUserByEmail(email);
            await this._userService?.updateUser({ userId: user?.userId as string, isVerified: IsVerifiedEnum.VERIFIED })
            await this._redisClient?.del(`verify-email-token:${token}`);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in verifyEmailToken service: ${error.message}`);
            if (error instanceof AlreadyUsedException || error instanceof InvalidTokenException || error instanceof NotFoundException) {
                throw error;
            }
            if (error instanceof TokenExpiredError) {
                throw new ExpiredException('Verify Email Token');
            }
            throw new Error('Could not verify the email token');
        }
    }

    public async forgetPassword(email: string): Promise<void> {
        try {
            const user = await this._userService?.getUserByEmail(email);
            if (!user) {
                throw new NotFoundException('User', 'email', email);
            }

            const resetToken = jwt.sign({ email }, OTT_SECRET, { expiresIn: ms(OTT_EXPIRY) });
            await this._redisClient?.setEx(`reset-token:${resetToken}`, ms(OTT_EXPIRY), email);

            const mailOptions = {
                to: email,
                subject: 'Password Reset Request',
                template: 'reset-password',
                context: {
                    link: `${DOMAIN}/reset-password?token=${resetToken}`,
                    expiry: OTT_EXPIRY,
                },
            };
            await this._emailService?.sendEmail(mailOptions);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in forgetPassword service: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error('Could not send the password reset email');
        }
    }

    public async changePassword(userId: string): Promise<void> {
        try {
            const user = await this._userService?.getUser(userId);
            const email = user?.companyEmail as string;
            if (!user) {
                throw new NotFoundException('User', 'userId', userId);
            }

            const resetToken = jwt.sign({ email }, OTT_SECRET, { expiresIn: ms(OTT_EXPIRY) });
            await this._redisClient?.setEx(`reset-token:${resetToken}`, ms(OTT_EXPIRY), email);

            const mailOptions = {
                to: email,
                subject: 'Password Change Request',
                template: 'reset-password',
                context: {
                    link: `${DOMAIN}/reset-password?token=${resetToken}`,
                    expiry: OTT_EXPIRY,
                },
            };
            await this._emailService?.sendEmail(mailOptions);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in changePasswordRequest service: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error('Could not send the password change email');
        }
    }


    public async verifyResetToken(token: string): Promise<string> {

        try {
            const decoded = jwt.verify(token, OTT_SECRET) as { email: string };
            if (!decoded.email) {
                throw new InvalidTokenException('Reset Token');
            }

            // retrieve the email from the cache
            const email = await this._redisClient?.get(`reset-token:${token}`);
            if (!email) {
                throw new AlreadyUsedException('Reset Token');
            }

            // ensure the email matches
            if (email !== decoded.email) {
                throw new InvalidTokenException('Reset Token');
            }

            return decoded.email;

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in verifyResetToken service: ${error.message}`);
            if (error instanceof AlreadyUsedException || error instanceof InvalidTokenException) {
                throw error;
            }
            if (error instanceof TokenExpiredError) {
                throw new ExpiredException('Reset Token');
            }
            throw new Error('Could not verify the reset token');
        }
    }

    public async resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            const email = await this.verifyResetToken(token);

            const user = await this._userService?.getUserByEmail(email);
            if (!user) {
                throw new NotFoundException('User', 'email', email);
            }

            await this._userService?.updateUser({ userId: user.userId, password: newPassword });

            await this._redisClient?.del(`reset-token:${token}`);

            // invalidate user sessions (access token and refresh token)
            await this._invalidateUserSessions(user.userId);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error in resetPassword service: ${error.message}`);
            if (error instanceof ExpiredException || error instanceof AlreadyUsedException || error instanceof InvalidTokenException) {
                throw error;
            }
            throw new Error('Could not reset the password');
        }
    }

    private async _invalidateUserSessions(userId: string): Promise<void> {
        try {
            await RefreshToken.destroy({ where: { userId } });

            // Delete all access tokens from Redis for the user
            // This assumes your access tokens are stored with a key like 'access-token:<userId>'
            const accessTokenKeys = await this._redisClient?.keys(`access-token:${userId}:*`);
            if (accessTokenKeys?.length) {
                await this._redisClient?.del(accessTokenKeys);
            }

            logger.info(`User sessions invalidated for user: ${userId}`);

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error invalidating sessions for user ${userId}: ${error.message}`);
            throw new Error('Could not invalidate user sessions');
        }

    }
}
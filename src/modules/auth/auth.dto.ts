import Joi from 'joi';

export const LoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const LogoutSchema = Joi.object({
    accessToken: Joi.string().required(),
    refreshToken: Joi.string().required(),
});

export const RefreshTokenSchema = Joi.object({

    refreshToken: Joi.string().required(),
});

export const VerifyEmailSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const ForgetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const ResetPasswordSchema = Joi.object({
    newPassword: Joi.string().required(),
});
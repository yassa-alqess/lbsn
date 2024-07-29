// import upload from "../../config/storage/multer.config";
import express from "express";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";
import { StatusCodes } from "http-status-codes";
import RefreshToken from "../../shared/models/refresh-token";
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../../shared/constants";
import jwt from 'jsonwebtoken'
import { UserPayload } from "../../shared/interfaces/auth";

const authRouter = express.Router();
const authController = new AuthController(new AuthService());

authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/forget-password", authController.forgetPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/verify-otp", authController.verifyOtp);
authRouter.post('/refresh-token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(StatusCodes.BAD_REQUEST);
    }

    const refreshToken = await RefreshToken.findOne({
        where: {
            value: token,
        },
    });

    if (!refreshToken)
        return res.sendStatus(StatusCodes.UNAUTHORIZED);


    if (refreshToken.expiresAt < new Date())
        return res.sendStatus(StatusCodes.UNAUTHORIZED);


    jwt.verify(token, REFRESH_TOKEN_SECRET, (err: jwt.VerifyErrors | null, user: string | jwt.JwtPayload | undefined) => {
        if (err) {
            return res.sendStatus(StatusCodes.UNAUTHORIZED);
        }

        const userPayload = user as UserPayload;

        const accessToken = jwt.sign({ id: userPayload.id, role: userPayload.role }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        res.json({ accessToken });
    });
});

// import upload from "../../config/storage/multer.config";
// import TokenController from "./tokens.controller";
// import TokenService from "./tokens.service";
// const tokenController = new TokenController(new TokenService());
// tokenRouter.post("/token", tokenController.issueToken);


import express from "express";
import RefreshToken from "@/shared/models/refresh-token";
import jwt from 'jsonwebtoken';
import { StatusCodes } from "http-status-codes";
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, } from "@/shared/constants";
import { UserPayload } from "@/shared/interfaces/auth";
const tokenRouter = express.Router();


tokenRouter.post('/token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(StatusCodes.BAD_REQUEST);
    }

    const refreshToken = await RefreshToken.findOne({
        where: {
            value: token,
        },
    });
    if (!refreshToken) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    if (refreshToken.expiresAt < new Date()) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    jwt.verify(token, REFRESH_TOKEN_SECRET, (err: jwt.VerifyErrors | null, user: string | jwt.JwtPayload | undefined) => {
        if (err) {
            return res.sendStatus(StatusCodes.UNAUTHORIZED);
        }

        const userPayload = user as UserPayload;

        const accessToken = jwt.sign({ id: userPayload.id, role: userPayload.role }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        res.json({ accessToken });
    });
});

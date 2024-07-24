// import upload from "../../config/storage/multer.config";
import express from "express";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";

const authRouter = express.Router();
const authController = new AuthController(new AuthService());


authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("refresh-token", authController.refreshToken);
// authRouter.post("/register", upload.single('image'), authController.register);

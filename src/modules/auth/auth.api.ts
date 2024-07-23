import upload from "../../config/storage/multer.config";
import express from "express";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";

const authRouter = express.Router();
const authController = new AuthController(new AuthService());


authRouter.post("/login", authController.login);
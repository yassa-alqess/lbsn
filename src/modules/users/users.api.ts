import { Router } from "express";
import UserController from "./users.controller";
import upload from "../../config/storage/multer.config";
import UserService from "./users.service";

const userRouter = Router();
const userController = new UserController(new UserService());
userRouter.post("/addUser", userController.addUser); //specify role
userRouter.post("/getUser", userController.getUser); //specify role
userRouter.post("/getUsers", userController.getUsers); //specify role
userRouter.post("/updateUser", userController.updateUser);
userRouter.post("/deleteUser", userController.deleteUser);
userRouter.post("/bulkAddUsers", upload("users")!.single("file"), userController.bulkAddUsers);


export default userRouter;
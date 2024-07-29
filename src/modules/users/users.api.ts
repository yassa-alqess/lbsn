import { Router } from "express";
import UserController from "./users.controller";
import upload from "../../config/storage/multer.config";
import UserService from "./users.service";

const userRouter = Router();
const userController = new UserController(new UserService());
userRouter.post("/add-tser", userController.addUser); //specify role
userRouter.post("/get-user", userController.getUser); //specify role
userRouter.post("/get-users", userController.getUsers); //specify role
userRouter.post("/update-user", userController.updateUser);
userRouter.post("/delete-user", userController.deleteUser);
userRouter.post("/bulk-add-users", upload("users")!.single("file"), userController.bulkAddUsers);


export default userRouter;
import { Router } from "express";
import UserController from "./users.controller";
import upload from "../../config/storage/multer.config";
import UserService from "./users.service";

const userRouter = Router();
const userController = new UserController(new UserService());
userRouter.post("/", userController.addUser); //add-user
userRouter.get("/:id", userController.getUser); //get-user
userRouter.get("/", userController.getUsers); //get-users
userRouter.patch("/:id", userController.updateUser); //update-user
userRouter.delete("/:id", userController.deleteUser); //delete-user
userRouter.post("/bulk-add-users", upload("users")!.single("file"), userController.bulkAddUsers); //bulk-add-users


export default userRouter;
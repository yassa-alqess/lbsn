// Purpose: Seed the database with some users. This is useful for testing and development purposes.
import { IUserAddPayload } from "../../modules/users/users.interface"
import UserService from "../../modules/users/users.service"
import { RoleEnum } from "../enums"

export const seedUsers = async () => {
    const _userService = new UserService()
    const userData: IUserAddPayload = {
        email: "yassa@gmail.com",
        name: "Yassa",
        companyName: "MGIL",
        phone: "123456789",
        location: "Cairo",
        password: "123456",
        roles: [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]
    }
    await _userService.addUser(userData)
}
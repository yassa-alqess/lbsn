// Desc: Seed roles in the database if they do not exist. This is useful for testing and development purposes.
import RoleService from "../../modules/roles/roles.service"
import _ from 'lodash'
import { RoleEnum } from "../enums"
export const seedRoles = async () => {
    const _roleService = new RoleService()
    const roles = Object.values(RoleEnum)
    const rolesToAdd = _.difference(roles, (await _roleService.getRoles())?.roles.map(role => role.name) as RoleEnum[])
    for (const role of rolesToAdd) {
        await _roleService.addRole({ name: role })
    }
}
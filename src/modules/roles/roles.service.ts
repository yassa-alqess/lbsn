import { IRoleAddPayload, IRoleResponse, IRolesGetResponse, IRoleUpdatePayload } from "./roles.interface";
import Role from "../../shared/models/role";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";

export default class RoleService {
    public async addRole(rolePayload: IRoleAddPayload): Promise<IRoleResponse> {
        const role = await Role.findOne({ where: { name: rolePayload.name } });
        if (role) {
            throw new AlreadyExistsException('Role', 'name', rolePayload.name.toString());
        }
        try {
            const role = await Role.create({ ...rolePayload });
            return {
                ...role.toJSON() as IRoleResponse,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding role: ${error.message}`);
            throw new Error(`Error adding role`);
        }
    }

    public async updateRole(rolePayload: IRoleUpdatePayload): Promise<IRoleResponse> {
        const { roleId } = rolePayload;
        const role = await Role.findByPk(roleId);
        if (!role) {
            throw new NotFoundException('Role', 'roleId', roleId);
        }
        try {

            await role.update({ ...rolePayload });
            return {
                ...role.toJSON() as IRoleResponse,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating role: ${error.message}`);
            throw new Error(`Error updating role`);
        }

    }
    public async getRole(roleId: string): Promise<IRoleResponse | undefined> {
        const role = await Role.findByPk(roleId);
        if (!role) {
            throw new NotFoundException('Role', 'roleId', roleId);
        }
        return {
            ...role.toJSON() as IRoleResponse,
        };
    }

    public async getRoles(): Promise<IRolesGetResponse | undefined> {
        const roles = await Role.findAll({});
        return {
            roles: roles.map(role => ({
                ...role.toJSON() as IRoleResponse
            }))
        };
    }

    public async deleteRole(roleId: string): Promise<void> {
        const role = await Role.findByPk(roleId);
        if (!role) {
            throw new NotFoundException('Role', 'roleId', roleId);
        }
        try {

            await role.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting role: ${error.message}`);
            throw new Error(`Error deleting role`);
        }
    }
}
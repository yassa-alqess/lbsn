import { IRoleAddPayload, IRoleResponse, IRolesGetResponse, IRoleUpdatePayload } from "./roles.interface";
import Role from "../../shared/models/role";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import logger from "../../config/logger";

export default class RoleService {
    public async addRole(rolePayload: IRoleAddPayload): Promise<IRoleResponse> {
        try {
            const role = await Role.findOne({ where: { name: rolePayload.name } });
            if (role) {
                throw new AlreadyExistsException('Role', 'name', rolePayload.name.toString());
            }
            const newRole = await Role.create({ ...rolePayload });
            const newRoleJson = newRole.toJSON() as IRoleResponse;
            return {
                ...newRoleJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding role: ${error.message}`);
            if (error instanceof AlreadyExistsException) {
                throw error;
            }
            throw new Error(`Error adding role: ${error.message}`);
        }
    }

    public async updateRole(rolePayload: IRoleUpdatePayload): Promise<IRoleResponse | undefined> {
        const { roleId } = rolePayload;
        try {
            const role = await Role.findByPk(roleId);
            if (!role) {
                throw new NotFoundException('Role', 'roleId', roleId);
            }

            const newRole = await role.update({ ...rolePayload });
            const newRoleJson = newRole.toJSON() as IRoleResponse;
            return {
                ...newRoleJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating role: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating role: ${error.message}`);
        }

    }

    public async getRole(roleId: string): Promise<IRoleResponse | undefined> {
        const role = await Role.findByPk(roleId);
        if (!role) {
            throw new NotFoundException('Role', 'roleId', roleId);
        }

        const roleJson = role.toJSON() as IRoleResponse;
        return {
            ...roleJson,
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
        try {
            const role = await Role.findByPk(roleId);
            if (!role) {
                throw new NotFoundException('Role', 'roleId', roleId);
            }
            await role.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting role: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting role: ${error.message}`);
        }
    }
}
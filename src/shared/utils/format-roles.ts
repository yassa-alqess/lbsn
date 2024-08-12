import logger from "../../config/logger";

export const formatRoles = (roles: string[]) => {
    if (roles && !Array.isArray(roles)) {
        logger.debug(`Roles are not an array, converting to array: ${roles}`);
        return [roles];
    }
    return roles;
}
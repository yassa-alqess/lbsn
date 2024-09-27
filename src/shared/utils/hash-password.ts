import logger from "../../config/logger";
import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
    try {
        return await bcrypt.hash(password, 10);
        //eslint-disable-next-line
    } catch (err: any) {
        logger.error(`Couldn't Hash The Password, ${err.message}`);
        throw new Error(`Couldn't Hash The Password`);
    }
}
import { Sequelize } from 'sequelize-typescript';
import logger from '../logger';
import { SCHEMA, DATABASE_NAME, DATABASE_URL, ENV } from '../../shared/constants';

class DatabaseManager {
    private static sqlInstance: Sequelize | null = null;

    private constructor() {

    }

    public static getSQLInstance(): Sequelize {
        if (!DatabaseManager.sqlInstance) {
            const modelsPath = ENV === 'development' ? '/../../shared/models/*.ts' : '/../../shared/models/*.js';
            DatabaseManager.sqlInstance = new Sequelize(DATABASE_URL as string, {
                models: [__dirname + modelsPath],
                logging: (query) => logger.info(query),
            });
        }
        return DatabaseManager.sqlInstance;
    }

    public static async syncSQLDB() {
        const sequelize = DatabaseManager.getSQLInstance();
        if (SCHEMA) await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA};`);
        await sequelize.sync({ alter: true, force: false });
        logger.info(`Connected to ${DATABASE_NAME} database`);
    }

    public static async pingSQLDB() {
        const sequelize = DatabaseManager.getSQLInstance();
        await sequelize.authenticate();
        logger.info('SQL Connection has been established successfully.');
    }

    public static async closeSQLConnection() {
        const sequelize = DatabaseManager.getSQLInstance();
        await sequelize.close();
        logger.info('SQL Connection has been closed gracefully');
    }
}

export default DatabaseManager;

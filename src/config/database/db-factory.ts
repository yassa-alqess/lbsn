import DatabaseManager from './db-manager';

export const initDatabases = async () => {
    await DatabaseManager.getMongoInstance();
    await DatabaseManager.syncSQLDB(); 
};

export const closeConnections = async () => {
    await DatabaseManager.closeSQLConnection();
    await DatabaseManager.closeMongoConnection();
};



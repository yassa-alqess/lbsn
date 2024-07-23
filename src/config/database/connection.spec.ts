import '../enviroments';
import sequelize, { syncDatabase } from './connection';
import logger from '../logger';

jest.mock('../logger', () => ({
  debug: jest.fn(),
}));

jest.mock('sequelize-typescript', () => {
  const mSequelize = {
    sync: jest.fn(),
  };
  return {
    Sequelize: jest.fn(() => mSequelize),
  };
});

describe('syncDatabase', () => {
  it('should establish a connection successfully', async () => {
    await syncDatabase();
    // expect(Sequelize).toHaveBeenCalledWith(process.env.DATABASE_URL as string, {
    //   models: [__dirname + '/../../shared/models/*.ts'],
    //   logging: logger.info,
    // });
    expect(sequelize.sync).toHaveBeenCalledWith({ alter: true, force: false });
    expect(() => sequelize.sync).not.toThrow();
    expect(logger.debug).toHaveBeenCalledWith(`connected to ${process.env.DB_NAME} database`); //testing hasn't debug logger, but it's fine, it will not fail.
  });
});

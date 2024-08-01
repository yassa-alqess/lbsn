import '../env';
import logger from './index';

describe('Logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });
  it('should contains proper level', () => {

    expect(logger.level).toMatch(process.env.LOG_LEVEL as string || ""); // env file is for sure loaded properly thanks to enviroments/index.ts

  });
});

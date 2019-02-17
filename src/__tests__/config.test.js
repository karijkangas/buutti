/*
 *
 */
/* eslint-disable global-require */

describe('config.js', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  test('test default', async () => {
    const config = require('../config');
    expect(config.API_PORT).toBeDefined();
  });

  test('test environment overrride', async () => {
    process.env.API_PORT = 1234;
    process.env.REDIS_HOST = 'foobar';
    const config = require('../config');
    expect(config.API_PORT).toBe(parseInt(process.env.API_PORT, 10));
    expect(config.redisOptions.host).toBe(process.env.REDIS_HOST);
  });
});

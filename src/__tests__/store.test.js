/*
 *
 */
/* eslint-disable global-require */

jest.mock('redis');

jest.mock('../logger');
jest.mock('../config');

let redis;
let store;
let client;

describe('store.js', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();

    redis = require('redis');
    store = require('../store');

    client = {
      on: jest.fn(),
      quit: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    redis.createClient.mockReturnValue(client);
  });

  test('test store initialize and shutdown ok', async () => {
    await store.initialize();

    expect(redis.createClient).toHaveBeenCalledTimes(1);

    expect(client.on).toHaveBeenCalledTimes(2);
    client.on.mock.calls[0][1]();
    client.on.mock.calls[1][1]();

    client.quit.mockImplementation(cb => cb());

    await store.shutdown();

    expect(client.quit).toBeCalledTimes(1);
  });

  test('test store initialize failure', async () => {
    redis.createClient.mockImplementation(() => {
      throw new Error('redis error');
    });

    await expect(store.initialize()).rejects.toThrow(/redis error/);

    await store.shutdown();

    expect(client.quit).not.toBeCalled();
  });

  test('test store shutdown failure', async () => {
    await store.initialize();

    client.quit.mockImplementation(() => {
      throw new Error('redis error');
    });

    await store.shutdown();

    expect(client.quit).toBeCalledTimes(1);
  });

  test('test store set ok', async () => {
    const key = 'hello-world';
    const value = 'fizzbuzz';
    const ttl = 42;

    client.set.mockImplementation((key_, value_, ex_, ttl_, cb) => {
      cb(null);
    });

    await store.initialize();

    await store.set(key, value, ttl);
    expect(client.set).toHaveBeenNthCalledWith(
      1,
      key,
      value,
      'EX',
      ttl,
      expect.any(Function)
    );
  });

  test('test store set failure', async () => {
    const key = 'hello-world';
    const value = 'fizzbuzz';
    const ttl = 42;

    await store.initialize();

    client.set.mockImplementation((key_, value_, ex_, ttl_, cb) => {
      cb(new Error('redis error'));
    });

    await expect(store.set(key, value, ttl)).rejects.toThrow(/redis error/);
  });

  test('test store get ok', async () => {
    const key = 'hello-world';
    const returnValue = 'return-value';

    client.get.mockImplementation((key_, cb) => {
      cb(null, returnValue);
    });

    await store.initialize();

    const v = await store.get(key);
    expect(v).toBe(returnValue);
    expect(client.get).toHaveBeenNthCalledWith(1, key, expect.any(Function));
  });

  test('test store get failure', async () => {
    const key = 'hello-world';

    await store.initialize();

    client.get.mockImplementation((key_, cb) => {
      cb(new Error('redis error'));
    });

    await expect(store.get(key)).rejects.toThrow(/redis error/);
  });

  test('test store del ok', async () => {
    const key = 'hello-world';

    client.del.mockImplementation((key_, cb) => {
      cb(null);
    });

    await store.initialize();

    await store.del(key);
    expect(client.del).toHaveBeenNthCalledWith(1, key, expect.any(Function));
  });

  test('test store del failure', async () => {
    const key = 'hello-world';

    await store.initialize();

    client.del.mockImplementation((key_, cb) => {
      cb(new Error('redis error'));
    });

    await expect(store.del(key)).rejects.toThrow(/redis error/);
  });
});

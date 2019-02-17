/*
 *
 */
/* eslint-disable global-require */

jest.mock('../store');

const store = require('../store');
const engine = require('../engine');

const { createHash } = require('./common');

describe('engine.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('test getToken is random', async () => {
    const ITERATIONS = 10;
    const tokens = new Set();

    for (let i = 0; i < ITERATIONS; i += 1) {
      const t = engine.getToken();
      expect(t).toBeDefined();
      expect(tokens.has(t)).toBeFalsy();
      tokens.add(t);
    }
  });

  const PASSWORD_MIN_LENGTH = 8;
  const PASSWORD_MAX_LENGTH = 32;

  test('test getPassword is random', async () => {
    const ITERATIONS = 10;
    const passwords = new Set();
    const token = 'hello-world';
    store.set.mockResolvedValue(true);

    for (let i = 0; i < ITERATIONS; i += 1) {
      const pw = await engine.getPassword(token);
      expect(typeof pw).toBe('string');
      expect(pw.length).toBeGreaterThanOrEqual(PASSWORD_MIN_LENGTH);
      expect(pw.length).toBeLessThanOrEqual(PASSWORD_MAX_LENGTH);
      expect(passwords.has(pw)).toBeFalsy();
      passwords.add(pw);
    }
  });

  test('test getPassword throws', async () => {
    store.set.mockRejectedValue(new Error('store error'));
    const token = 'hello-world';
    await expect(engine.getPassword(token)).rejects.toThrow(/store error/);
  });

  test('test validatePassword', async () => {
    const SALT_ROUNDS = 10;
    const token = 'hello-world';
    const password = 'fizzbuzz';
    const hash = await createHash(password, SALT_ROUNDS);

    store.get.mockResolvedValue(password);

    const ok = await engine.validatePassword(token, hash);
    expect(ok).toBe(true);
    expect(store.del).toHaveBeenNthCalledWith(1, token);

    const nok = await engine.validatePassword(token, 'fizzbuzz');
    expect(nok).toBe(false);
    expect(store.del).toHaveBeenCalledTimes(1);
  });

  test('test validatePassword throws', async () => {
    store.get.mockRejectedValue(new Error('store error'));
    const token = 'hello-world';
    const password = 'fizzbuzz';
    await expect(engine.validatePassword(token, password)).rejects.toThrow(
      /store error/
    );
  });
});

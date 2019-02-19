/*
 *
 */
/* eslint-disable global-require */
jest.mock('../store');
jest.mock('../engine');
jest.mock('../config');
jest.mock('../logger');

let request;
let store;
let engine;
let app;
let logger;

describe('app.js', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();

    request = require('supertest');
    store = require('../store');
    engine = require('../engine');
    logger = require('../logger');

    app = require('../app');
  });

  test('app initialize and shutdown ok', async () => {
    const a = await app.initialize();

    expect(a).toBeDefined();
    expect(store.initialize).toBeCalled();

    await app.shutdown();

    expect(store.shutdown).toBeCalled();
  });

  test('app initialize failure ok', async () => {
    store.initialize.mockRejectedValue(new Error('store error'));

    await expect(app.initialize()).rejects.toThrow(/store error/);
  });

  test('app shutdown failure ok', async () => {
    store.shutdown.mockRejectedValue(new Error('store error'));

    await app.initialize();
    await app.shutdown();
  });

  test('app /string GET ok', async () => {
    const token = 'test-token';
    const password = 'test-password';
    engine.getToken.mockReturnValue(token);
    engine.getPassword.mockResolvedValue(password);

    const a = await app.initialize();

    const r = await request(a)
      .get('/string')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.header['set-cookie']).toHaveLength(1);
    expect(r.header['set-cookie'][0]).toMatch(token);

    expect(engine.getPassword).toHaveBeenNthCalledWith(1, token);
    expect(r.body).toEqual({ data: password });
  });

  test('app /string GET failure', async () => {
    const token = 'test-token';
    engine.getToken.mockReturnValue(token);
    engine.getPassword.mockRejectedValue(new Error('engine error'));

    const a = await app.initialize();

    const r = await request(a)
      .get('/string')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(r.header['set-cookie']).not.toBeDefined();
    expect(r.body).toEqual({
      error: { code: 500, detail: 'Internal Server Error' },
    });
  });

  test('app /string POST OK/NOK', async () => {
    const token = 'test-token';
    const password = 'test-password';
    engine.getToken.mockReturnValue(token);
    engine.getPassword.mockResolvedValue(password);
    engine.validatePassword.mockResolvedValue(true);

    const a = await app.initialize();

    let r = await request(a)
      .get('/string')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    // await resolvePromises();

    expect(r.header['set-cookie']).toHaveLength(1);
    expect(r.header['set-cookie'][0]).toMatch(token);
    expect(r.body).toEqual({ data: password });

    const cookie = r.header['set-cookie'][0];

    r = await request(a)
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookie)
      .send({ string: password })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'OK' });
    expect(engine.validatePassword).toHaveBeenNthCalledWith(1, token, password);

    engine.validatePassword.mockResolvedValue(false);
    r = await request(a)
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookie)
      .send({ string: 'foobar' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'NOK' });
  });

  test('app /foobar GET 404 ok', async () => {
    const a = await app.initialize();

    const r = await request(a)
      .get('/foobar')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(r.body).toEqual({ error: { code: 404, detail: 'Not Found' } });
  });

  test('app /string POST failure', async () => {
    const token = 'test-token';
    const password = 'test-password';
    engine.validatePassword.mockRejectedValue(new Error('engine error'));

    const a = await app.initialize();

    const r = await request(a)
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', { token })
      .send({ string: password })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(r.body).toEqual({
      error: { code: 500, detail: 'Internal Server Error' },
    });
    expect(logger.error).toBeCalled();
  });
});

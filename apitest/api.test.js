/*
 *
 */
const request = require('supertest');
const cookie = require('cookie');
const bcrypt = require('bcryptjs');

const address = 'http://127.0.0.1:3000';

async function createHash(secret) {
  const BCRYPT_SALT_ROUNDS = 10;
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(secret, salt);
}

describe('Test /string', () => {
  const req = request(address);

  test('It should respond to GET', async () => {
    const r = await req
      .get('/string')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body.data).toBeDefined();
  });

  test('It should set cookie in GET', async () => {
    const r = await req
      .get('/string')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.header['set-cookie']).toHaveLength(1);
    const c = cookie.parse(r.header['set-cookie'][0]);
    expect(c.token).toBeDefined();
  });

  test('It should set a new cookie per GET', async () => {
    const ITERATIONS = 5;
    const tokens = new Set();
    for (let i = 0; i < ITERATIONS; i += 1) {
      const r = await req
        .get('/string')
        .set('Accept', 'application/json')
        .expect(200);

      expect(r.header['set-cookie']).toHaveLength(1);
      const c = cookie.parse(r.header['set-cookie'][0]);
      expect(tokens.has(c.token)).toBeFalsy();
      tokens.add(c.token);
    }
  });

  test('It should create a new string per GET', async () => {
    const ITERATIONS = 10;
    const MIN_LENGTH = 8;
    const MAX_LENGTH = 32;
    const strings = new Set();
    for (let i = 0; i < ITERATIONS; i += 1) {
      const r = await req
        .get('/string')
        .set('Accept', 'application/json')
        .expect(200);

      const s = r.body.data;
      expect(typeof s).toBe('string');
      const l = s.length;
      expect(l).toBeGreaterThanOrEqual(MIN_LENGTH);
      expect(l).toBeLessThanOrEqual(MAX_LENGTH);
      expect(strings.has(s)).toBeFalsy();
      strings.add(s);
    }
  });

  test.skip('String length should be between min and max', async () => {
    /* NOTE: length is random between MIN and MAX; so this test
       may potentially fail as there is always a possibility that some
       string length between MIN and MAX is not create; hence skip by
       default  */
    jest.setTimeout(60 * 1000);
    const MIN_LENGTH = 8;
    const MAX_LENGTH = 32;
    const MAX_ITERATIONS = (MAX_LENGTH - MIN_LENGTH) * 10;

    const stringLengths = new Set();
    for (let i = 0; i < MAX_ITERATIONS; i += 1) {
      const r = await req
        .get('/string')
        .set('Accept', 'application/json')
        .expect(200);

      const s = r.body.data;
      expect(typeof s).toBe('string');
      const l = s.length;
      expect(l).toBeGreaterThanOrEqual(MIN_LENGTH);
      expect(l).toBeLessThanOrEqual(MAX_LENGTH);
      stringLengths.add(s.length);
    }
    expect([...stringLengths].sort()).toEqual(
      [...Array(MAX_LENGTH - MIN_LENGTH + 1).keys()]
        .map(i => i + MIN_LENGTH)
        .sort()
    );
  });

  test('It should respond OK to correct POST', async () => {
    let r = await req
      .get('/string')
      .set('Accept', 'application/json')
      .expect(200);
    const c = r.header['set-cookie'];
    const { data } = r.body;

    // const string = data;
    const string = await createHash(data);

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', c)
      .send({ string })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'OK' });
  });

  test('It should delete string after OK POST', async () => {
    let r = await req
      .get('/string')
      .set('Accept', 'application/json')
      .expect(200);
    const c = r.header['set-cookie'];
    const { data } = r.body;

    // const string = data;
    const string = await createHash(data);

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', c)
      .send({ string })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'OK' });

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', c)
      .send({ string })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'NOK' });
  });

  test('It should respond NOK to incorrect cookie POST', async () => {
    let r = await req
      .get('/string')
      .set('Accept', 'application/json')
      .expect(200);
    const c = r.header['set-cookie'];
    const { data } = r.body;

    // const string = data;
    const string = await createHash(data);

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      // .set('Cookie', c)
      .send({ string })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'NOK' });

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', 'foo')
      .send({ string })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'NOK' });

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', c)
      .send({ string })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'OK' });
  });

  test('It should respond NOK to incorrect data POST', async () => {
    let r = await req
      .get('/string')
      .set('Accept', 'application/json')
      .expect(200);
    const c = r.header['set-cookie'];
    const { data } = r.body;

    // const string = data;
    const string = await createHash(data);

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', c)
      .send({ string: `foo ${string} bar` })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'NOK' });

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', c)
      .send({ string })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'OK' });
  });

  test.skip('It should respond NOK to timed out POST', async () => {
    /* NOTE: set SECRET_TTL to 1 (second) before running this test */

    const SECRET_TIMEOUT = 2000;
    jest.setTimeout(SECRET_TIMEOUT * 2);

    let r = await req
      .get('/string')
      .set('Accept', 'application/json')
      .expect(200);
    const c = r.header['set-cookie'];
    const { data } = r.body;

    // const string = data;
    const string = await createHash(data);

    await new Promise(resolve => {
      setTimeout(resolve, SECRET_TIMEOUT);
    });

    r = await req
      .post('/string')
      .set('Content-Type', 'application/json')
      .set('Cookie', c)
      .send({ string })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(r.body).toEqual({ data: 'NOK' });
  });
});

describe('Test service', () => {
  const req = request(address);

  test('It should report 404 for unexpected GET', async () => {
    let r = await req.get('/').expect(404);

    expect(r.body.error).toEqual({
      code: 404,
      detail: 'Not Found',
    });

    r = await req.get('/foobar').expect(404);

    expect(r.body.error).toEqual({
      code: 404,
      detail: 'Not Found',
    });
  });

  test('It should report 404 for unexpected POST', async () => {
    let r = await req
      .post('/foobar')
      .set('Accept', 'application/json')
      .expect(404);

    expect(r.body.error).toEqual({
      code: 404,
      detail: 'Not Found',
    });

    r = await req
      .post('/foobar')
      .set('Accept', 'application/json')
      .expect(404);

    expect(r.body.error).toEqual({
      code: 404,
      detail: 'Not Found',
    });
  });

  test.skip('It should return 500 to internal server error', async () => {
    /* NOTE: scale buutti_redis to 0 before running this test */

    const r = await req
      .get('/string')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(r.body.error).toEqual({
      code: 500,
      detail: 'Internal Server Error',
    });
  });
});

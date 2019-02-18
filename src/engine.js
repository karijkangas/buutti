/*
 *
 */

const crypto = require('crypto');
const uuidv4 = require('uuid/v4');
const randomize = require('randomatic');
const bcrypt = require('bcryptjs');

const store = require('./store');

const {
  PASSWORD_PATTERN,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_TTL,
} = require('./config');

function createPassword(min, max) {
  const delta = max - min;
  const len = min + (crypto.randomBytes(1).readUInt8(0) % (delta + 1));
  return randomize(PASSWORD_PATTERN, len);
}

function getToken() {
  return uuidv4();
}

async function getPassword(token) {
  const password = createPassword(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH);

  await store.set(token, password, PASSWORD_TTL);
  return password;
}

async function validatePassword(token, password) {
  const storedPassword = await store.get(token);
  const ok = storedPassword && (await bcrypt.compare(storedPassword, password));

  if (ok) {
    await store.del(token);
  }

  return ok;
}

module.exports = { getToken, getPassword, validatePassword };

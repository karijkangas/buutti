/*
 *
 */

const bcrypt = require('bcryptjs');

function resolvePromises() {
  return new Promise(resolve => {
    setImmediate(resolve);
  });
}

async function createHash(secret, rounds) {
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(secret, salt);
}

module.exports = { resolvePromises, createHash };

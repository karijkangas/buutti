/*
 *
 */
require('dotenv').config();

function envInt(v) {
  return parseInt(process.env[v], 10);
}

const config = {
  API_PORT: envInt('API_PORT') || 3000,
  cookieOptions: {
    ttl: envInt('COOKIE_TTL') || 1000 * 60 * 15,
    domain: process.env.COOKIE_DOMAIN,
  },
  redisOptions: {
    host: process.env.REDIS_HOST || 'redis',
    port: envInt('REDIS_PORT') || 6379,
  },
  PASSWORD_PATTERN: process.env.PASSWORD_PATTERN || '*',
  PASSWORD_MIN_LENGTH: envInt('PASSWORD_MIN_LENGTH') || 8,
  PASSWORD_MAX_LENGTH: envInt('PASSWORD_MAX_LENGTH') || 32,
  PASSWORD_TTL: envInt('PASSWORD_TTL') || 60 * 15,
  // BCRYPT_SALT_ROUNDS: envInt('BCRYPT_SALT_ROUNDS') || 10,
};

module.exports = config;

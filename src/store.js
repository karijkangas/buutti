/*
 *
 */

const redis = require('redis');
const { promisify } = require('util');

const { info, error } = require('./logger');
const { redisOptions } = require('./config');

let redisClient;

async function initialize() {
  info('store.initialize');
  const options = { ...redisOptions, enable_offline_queue: false };
  try {
    redisClient = redis.createClient(options);
    redisClient.on('error', err => {
      error(`store redisClient error: ${err}`);
    });
    redisClient.on('ready', () => {
      info('store redisClient ready');
    });
  } catch (e) {
    error(`store.initialize failed: ${e}`);
    redisClient = undefined;
    throw e;
  }
}

async function shutdown() {
  info('store.shutdown');
  if (redisClient) {
    try {
      await new Promise(resolve => {
        redisClient.quit(resolve);
      });
    } catch (e) {
      info(`store.shutdown not graceful: ${e}`);
    }
    redisClient = undefined;
  }
}

async function set(key, value, ttl) {
  const redisSet = promisify(redisClient.set).bind(redisClient);
  await redisSet(key, value, 'EX', ttl);
}

async function get(key) {
  const redisGet = promisify(redisClient.get).bind(redisClient);
  return redisGet(key);
}

async function del(key) {
  const redisDel = promisify(redisClient.del).bind(redisClient);
  await redisDel(key);
}

module.exports = { initialize, shutdown, set, get, del };

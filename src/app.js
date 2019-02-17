/*
 *
 */
const express = require('express');
const cookieParser = require('cookie-parser');

const { router, sendError } = require('./api');
const store = require('./store');
const logger = require('./logger');

const { info } = logger;

async function initialize() {
  info('app.initialize');

  await store.initialize();

  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(logger.express);
  app.use(router);

  /* handle unexpected errors */
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    sendError(res, 500, 'Internal Server Error');
  });

  return app;
}

async function shutdown() {
  info('app.shutdown');
  try {
    await store.shutdown();
  } catch (e) {
    /* ignore error */
  }
}

module.exports = { initialize, shutdown };

/*
 *
 */

const { initialize, shutdown } = require('./app');
const { API_PORT } = require('./config');
const { info } = require('./logger');

let httpServer; // eslint-disable-line no-unused-vars

process.on('SIGTERM', async () => {
  try {
    await shutdown();
    /* do not bother closing the httpServer */
  } catch (e) {
    /* ignore */
  }

  process.exit(0);
});

/* assume service is simply restarted if it fails to start */
(async () => {
  info('starting server');
  const app = await initialize(); /* ignore error */
  httpServer = app.listen(API_PORT, () => {
    info(`server started, listening port ${API_PORT}`);
  });
})();

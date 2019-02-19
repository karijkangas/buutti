/*
 *
 */
const { API_PORT } = require('./config'); /* first to enable dotenv ASAP */

const app = require('./app');
const { info } = require('./logger');

let httpServer; // eslint-disable-line no-unused-vars

process.on('SIGTERM', async () => {
  try {
    await app.shutdown();
    /* do not bother closing the httpServer; process.exit does this also */
  } catch (e) {
    /* ignore */
  }

  process.exit(0);
});

(async () => {
  info('starting server');

  /* ignore error; assume service is simply restarted if it fails to start */
  httpServer = (await app.initialize()).listen(API_PORT, () => {
    info(`server started, listening port ${API_PORT}`);
  });
})();

/*
 *
 */

const { createLogger, format, transports } = require('winston');
const expressWinston = require('express-winston');

const express = expressWinston.logger({
  transports: [new transports.Console()],
  format: format.combine(format.colorize(), format.timestamp(), format.json()),
});

const logger = createLogger({
  format: format.combine(format.colorize(), format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

module.exports = {
  express,
  info: logger.log.bind(logger, 'info'),
  error: logger.log.bind(logger, 'error'),
};

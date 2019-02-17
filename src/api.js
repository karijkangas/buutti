/*
 *
 */
const express = require('express');
const { getToken, getPassword, validatePassword } = require('./engine');
const { cookieOptions } = require('./config');

const API_PATH = '/string';
const COOKIE_NAME = 'token';

cookieOptions.path = API_PATH;

const router = express.Router();

function sendReply(res, data, status = 200) {
  res.status(status).json({ data });
}

function sendError(res, code, error) {
  res.status(code).json({ error: { code, detail: error } });
}

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// eslint-disable-next-line no-unused-vars
router.get(
  API_PATH,
  asyncMiddleware(async (req, res) => {
    const token = getToken();
    const password = await getPassword(token);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    sendReply(res, password);
  })
);

// eslint-disable-next-line no-unused-vars
router.post(
  API_PATH,
  asyncMiddleware(async (req, res) => {
    const token = req.cookies[COOKIE_NAME];
    const password = req.body.string;
    if (await validatePassword(token, password)) {
      sendReply(res, 'OK');
    } else {
      sendReply(res, 'NOK');
    }
  })
);

module.exports = { router, sendError };

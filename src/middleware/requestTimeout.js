'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Fail requests that take longer than a fixed budget.
 * Guards against handlers that hang and never respond. When the timer
 * fires before the response has been sent, a 503 is forwarded to the
 * error handler; the timer is always cleared once the response finishes.
 *
 * @param {object} [options]
 * @param {number} [options.ms] - timeout budget in milliseconds.
 * @returns {import('express').RequestHandler}
 */
function requestTimeout(options = {}) {
  const ms = options.ms || 15 * 1000;

  return function requestTimeoutMiddleware(req, res, next) {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        next(
          ApiError.serviceUnavailable('Request timed out', { timeoutMs: ms })
        );
      }
    }, ms);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}

module.exports = requestTimeout;

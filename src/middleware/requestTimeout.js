'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Fail requests that take longer than a fixed budget.
 * Guards against handlers that hang and never respond. When the timer
 * fires before the response has been sent, a 503 is forwarded to the
 * error handler; the timer is always cleared once the response finishes.
 *
 * Mounting this more than once on the same request (e.g. once globally
 * in app.js and again on a specific router) lets the later instance
 * override the budget for that route: it clears whatever timer is
 * already pending on the request before starting its own, rather than
 * stacking a second timer that could fire at the wrong time.
 *
 * @param {object} [options]
 * @param {number} [options.ms] - timeout budget in milliseconds.
 * @returns {import('express').RequestHandler}
 */
function requestTimeout(options = {}) {
  const ms = options.ms || 15 * 1000;

  return function requestTimeoutMiddleware(req, res, next) {
    if (req._requestTimeoutTimer) {
      clearTimeout(req._requestTimeoutTimer);
    }

    const timer = setTimeout(() => {
      if (!res.headersSent) {
        next(
          ApiError.serviceUnavailable('Request timed out', { timeoutMs: ms })
        );
      }
    }, ms);

    req._requestTimeoutTimer = timer;

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}

module.exports = requestTimeout;

'use strict';

const logger = require('../utils/logger');

/**
 * Lightweight request logger.
 * Logs the method, path and response status once the response finishes,
 * along with how long the request took.
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

module.exports = requestLogger;

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
    const id = req.id ? ` [${req.id}]` : '';
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms${id}`);
  });
  next();
}

module.exports = requestLogger;

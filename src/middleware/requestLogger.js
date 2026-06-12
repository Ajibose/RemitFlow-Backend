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
    logger.info(
      logger.fields({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - start,
        requestId: req.id,
      })
    );
  });
  next();
}

module.exports = requestLogger;

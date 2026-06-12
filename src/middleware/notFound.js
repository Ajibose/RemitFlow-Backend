'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Catch-all middleware for unmatched routes.
 * Forwards a 404 ApiError to the central error handler.
 */
function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;

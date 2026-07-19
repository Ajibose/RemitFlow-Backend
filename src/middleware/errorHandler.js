'use strict';

const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { captureError } = require('../services/errorTrackingService');

/**
 * Central Express error handler.
 * Renders a consistent JSON error envelope, hides internal
 * details for unexpected (non-ApiError) failures, and
 * feeds every error through the error-tracking hook.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  if (!isApiError) {
    logger.error('Unhandled error:', err.stack || err.message);
  }

  captureError(err, req);

  res.status(statusCode).json({
    error: {
      message: isApiError ? err.message : 'Internal server error',
      status: statusCode,
      details: isApiError ? err.details : undefined,
      requestId: req.id,
      at: new Date().toISOString(),
    },
  });
}

module.exports = errorHandler;

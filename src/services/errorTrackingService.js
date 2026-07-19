'use strict';

const config = require('../config');
const logger = require('../utils/logger');

/**
 * Error tracking service.
 *
 * Captures runtime errors and passes them through a configurable transport
 * (console by default). Designed as a replaceable hook so contributors can
 * swap in Sentry, Rollbar, or any other provider without touching middleware.
 *
 * Each transport receives the full error envelope:
 *   { message, stack, statusCode, requestId, method, url, details, at }
 */

/** Default console transport — logs structured fields to stderr. */
function consoleTransport(payload) {
  const { message, statusCode, requestId, method, url, details, at } = payload;
  const ctx = logger.fields({
    status: statusCode,
    requestId,
    method,
    url,
    details: details ? JSON.stringify(details) : undefined,
    at,
  });
  logger.error(`[ErrorTracking] ${message} ${ctx}`);
}

/**
 * @param {Error} err - the error that occurred.
 * @param {object} [req] - the Express request object (optional).
 * @returns {Promise<void>}
 */
async function captureError(err, req) {
  if (!config.errorTracking.enabled) return;

  const envelope = {
    message: err.message || 'Unknown error',
    stack: err.stack,
    statusCode: err.statusCode || 500,
    requestId: req ? req.id : undefined,
    method: req ? req.method : undefined,
    url: req ? req.originalUrl || req.url : undefined,
    details: err.details || undefined,
    at: new Date().toISOString(),
  };

  try {
    consoleTransport(envelope);
  } catch (transportErr) {
    process.stderr.write(`[ErrorTracking] Transport failed: ${transportErr.message}\n`);
  }
}

module.exports = {
  captureError,
};

'use strict';

const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * Maintenance-mode middleware.
 *
 * When `config.maintenanceMode` is true (or when the exported
 * `isEnabled` helper returns true) every request that is not
 * directed at the health endpoints is rejected with a 503.
 *
 * Health routes (/api/health and /api/version) are always allowed
 * through so monitoring systems can still probe liveness/readiness
 * during a maintenance window.
 *
 * To enable maintenance mode at runtime, set the environment variable:
 *   MAINTENANCE_MODE=true
 *
 * The middleware reads `config.maintenanceMode` on every request so the
 * flag can be toggled by mutating the config object in tests (or by a
 * future admin endpoint) without restarting the process.
 */

/** Paths that remain available while maintenance mode is active. */
const ALLOWED_PATHS = ['/api/health', '/api/health/', '/api/version'];

/**
 * Returns true when maintenance mode is currently enabled.
 * Exported so tests and other modules can inspect the state.
 * @returns {boolean}
 */
function isEnabled() {
  return config.maintenanceMode === true;
}

/**
 * Express middleware. Call next() normally when maintenance mode is off
 * or for health/version routes; otherwise forward a 503 ApiError.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function maintenanceMode(req, res, next) {
  if (!isEnabled()) {
    return next();
  }

  // Allow health-check paths to pass through unconditionally.
  const path = req.path || '';
  const isHealthPath = ALLOWED_PATHS.some((p) => path === p || path.startsWith('/api/health'));
  if (isHealthPath) {
    return next();
  }

  return next(
    ApiError.serviceUnavailable(
      'The service is currently undergoing scheduled maintenance. Please try again later.',
      { maintenanceMode: true }
    )
  );
}

module.exports = maintenanceMode;
module.exports.isEnabled = isEnabled;

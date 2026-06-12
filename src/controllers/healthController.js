'use strict';

const config = require('../config');
const { name, version } = require('../../package.json');

/**
 * Health controller.
 */

/**
 * GET /api/health
 * Reports basic liveness information.
 */
function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'remitflow-backend',
    version,
    env: config.env,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /api/version
 * Reports the service name and version.
 */
function getVersion(req, res) {
  res.json({
    name,
    version,
    env: config.env,
  });
}

/**
 * GET /api/health/live
 * Liveness probe: confirms the process is up and responding.
 */
function getLiveness(req, res) {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
}

/**
 * GET /api/health/ready
 * Readiness probe: confirms dependencies needed to serve traffic are up.
 * The demo store is always in-memory, so readiness simply mirrors liveness.
 */
function getReadiness(req, res) {
  res.json({
    status: 'ready',
    checks: { store: 'ok' },
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
  getVersion,
  getLiveness,
  getReadiness,
};

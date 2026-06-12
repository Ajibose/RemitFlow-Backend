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

module.exports = {
  getHealth,
  getVersion,
};

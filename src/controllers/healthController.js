'use strict';

const config = require('../config');
const { version } = require('../../package.json');

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

module.exports = {
  getHealth,
};

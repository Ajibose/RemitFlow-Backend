'use strict';

const config = require('../config');

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
    env: config.env,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};

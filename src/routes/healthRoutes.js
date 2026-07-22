'use strict';

const express = require('express');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const requestTimeout = require('../middleware/requestTimeout');
const healthController = require('../controllers/healthController');

const router = express.Router();

// Health probes should fail fast rather than waiting out the global
// request timeout budget.
router.use(requestTimeout({ ms: config.routeTimeouts.healthMs }));

// GET /api/health
router.get('/', asyncHandler(healthController.getHealth));

// GET /api/health/live
router.get('/live', asyncHandler(healthController.getLiveness));

// GET /api/health/ready
router.get('/ready', asyncHandler(healthController.getReadiness));

module.exports = router;

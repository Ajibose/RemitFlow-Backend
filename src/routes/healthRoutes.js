'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const healthController = require('../controllers/healthController');

const router = express.Router();

// GET /api/health
router.get('/', asyncHandler(healthController.getHealth));

// GET /api/health/live
router.get('/live', asyncHandler(healthController.getLiveness));

module.exports = router;

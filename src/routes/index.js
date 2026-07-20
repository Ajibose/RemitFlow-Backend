'use strict';

const express = require('express');
const cacheControl = require('../middleware/cacheControl');
const asyncHandler = require('../utils/asyncHandler');
const healthController = require('../controllers/healthController');
const healthRoutes = require('./healthRoutes');
const rateRoutes = require('./rateRoutes');
const transferRoutes = require('./transferRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// GET /api/version
router.get(
  '/version',
  cacheControl({ policy: 'public', maxAge: 3600 }),
  asyncHandler(healthController.getVersion)
);

// Mount the feature routers under the /api namespace.
router.use('/health', healthRoutes);
router.use('/', rateRoutes);
router.use('/transfers', transferRoutes);
router.use('/users', userRoutes);

module.exports = router;

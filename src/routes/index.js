'use strict';

const express = require('express');
const healthRoutes = require('./healthRoutes');
const rateRoutes = require('./rateRoutes');
const transferRoutes = require('./transferRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Mount the feature routers under the /api namespace.
router.use('/health', healthRoutes);
router.use('/', rateRoutes);
router.use('/transfers', transferRoutes);
router.use('/users', userRoutes);

module.exports = router;

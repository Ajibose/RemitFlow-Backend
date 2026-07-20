'use strict';

const express = require('express');
const config = require('../config');
const cacheControl = require('../middleware/cacheControl');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const rateController = require('../controllers/rateController');
const { validateQuoteQuery } = require('../validators/quoteValidator');

const router = express.Router();

// GET /api/rates
router.get(
  '/rates',
  cacheControl({ policy: 'public', maxAge: config.cache.ratesMaxAge }),
  asyncHandler(rateController.getRates)
);

// GET /api/rates/:pair (e.g. /api/rates/USD-INR)
router.get(
  '/rates/:pair',
  cacheControl({ policy: 'public', maxAge: config.cache.ratesMaxAge }),
  asyncHandler(rateController.getRatePair)
);

// GET /api/quote?amount=&from=&to=
router.get(
  '/quote',
  validate(validateQuoteQuery),
  asyncHandler(rateController.getQuote)
);

module.exports = router;

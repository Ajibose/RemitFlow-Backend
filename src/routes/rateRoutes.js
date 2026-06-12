'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const rateController = require('../controllers/rateController');
const { validateQuoteQuery } = require('../validators/quoteValidator');

const router = express.Router();

// GET /api/rates
router.get('/rates', asyncHandler(rateController.getRates));

// GET /api/quote?amount=&from=&to=
router.get(
  '/quote',
  validate(validateQuoteQuery),
  asyncHandler(rateController.getQuote)
);

module.exports = router;

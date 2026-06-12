'use strict';

const rateService = require('../services/rateService');
const quoteService = require('../services/quoteService');

/**
 * Rate and quote controllers.
 */

/**
 * GET /api/rates
 * Returns the supported currencies and their USD rate.
 */
function getRates(req, res) {
  res.json({
    base: 'USD',
    rates: rateService.listRates(),
  });
}

/**
 * GET /api/quote?amount=&from=&to=
 * Returns an FX quote including the fee breakdown.
 */
function getQuote(req, res) {
  const { amount, from, to } = req.query;
  const quote = quoteService.getQuote(amount, from, to);
  res.json(quote);
}

module.exports = {
  getRates,
  getQuote,
};

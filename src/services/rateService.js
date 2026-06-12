'use strict';

const { RATES_TO_USD, SUPPORTED_CURRENCIES } = require('../config/rates');
const money = require('../utils/money');
const ApiError = require('../utils/ApiError');

/**
 * Foreign exchange helpers built on top of the mock rate table.
 */

/**
 * Return the full list of supported currencies and their USD rate.
 * @returns {Array<{currency: string, rateToUsd: number}>}
 */
function listRates() {
  return SUPPORTED_CURRENCIES.map((currency) => ({
    currency,
    rateToUsd: RATES_TO_USD[currency],
  }));
}

/**
 * Check whether a currency code is supported.
 * @param {string} currency
 * @returns {boolean}
 */
function isSupported(currency) {
  return Object.prototype.hasOwnProperty.call(RATES_TO_USD, currency);
}

/**
 * Compute the exchange rate to convert one unit of `from` into `to`.
 * @param {string} from
 * @param {string} to
 * @returns {number}
 */
function getRate(from, to) {
  if (!isSupported(from)) {
    throw ApiError.badRequest(`Unsupported source currency: ${from}`);
  }
  if (!isSupported(to)) {
    throw ApiError.badRequest(`Unsupported target currency: ${to}`);
  }
  // Convert source -> USD -> target.
  return RATES_TO_USD[from] / RATES_TO_USD[to];
}

/**
 * Convert an amount from one currency to another.
 * @param {number} amount
 * @param {string} from
 * @param {string} to
 * @returns {number}
 */
function convert(amount, from, to) {
  const rate = getRate(from, to);
  return money.round(amount * rate);
}

module.exports = {
  listRates,
  isSupported,
  getRate,
  convert,
};

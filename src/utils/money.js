'use strict';

/**
 * Money helpers.
 * All amounts are treated as plain numbers but rounded to a fixed
 * number of decimal places to avoid floating point surprises.
 */

const DECIMALS = 2;

/**
 * Round a numeric amount to the configured number of decimals.
 * @param {number} amount
 * @returns {number}
 */
function round(amount) {
  const factor = 10 ** DECIMALS;
  return Math.round((Number(amount) + Number.EPSILON) * factor) / factor;
}

/**
 * Determine whether a value is a usable positive amount.
 * @param {*} value
 * @returns {boolean}
 */
function isPositiveAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

/**
 * Format an amount with its currency code, e.g. "10.00 USD".
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
function format(amount, currency) {
  return `${round(amount).toFixed(DECIMALS)} ${currency}`;
}

module.exports = {
  DECIMALS,
  round,
  isPositiveAmount,
  format,
};

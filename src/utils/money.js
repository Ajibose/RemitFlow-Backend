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
 * Constrain a numeric amount to an inclusive [min, max] range.
 * Non-numeric input falls back to the minimum bound.
 * @param {number} amount
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(amount, min, max) {
  const n = Number(amount);
  if (!Number.isFinite(n)) {
    return min;
  }
  return Math.min(Math.max(n, min), max);
}

/**
 * Compute `percent` percent of `amount`, rounded to the money precision.
 * @param {number} amount
 * @param {number} percent - e.g. 1.5 for 1.5%.
 * @returns {number}
 */
function percentage(amount, percent) {
  return round(Number(amount) * (Number(percent) / 100));
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
  clamp,
  percentage,
  format,
};

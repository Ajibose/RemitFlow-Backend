'use strict';

/**
 * Small string helpers used across validators and services.
 */

/**
 * Trim surrounding whitespace, returning '' for non-string input.
 * @param {*} value
 * @returns {string}
 */
function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Determine whether a value is a non-empty string once trimmed.
 * @param {*} value
 * @returns {boolean}
 */
function isNonEmpty(value) {
  return clean(value).length > 0;
}

/**
 * Truncate a string to `max` characters, appending an ellipsis when cut.
 * @param {string} value
 * @param {number} max
 * @returns {string}
 */
function truncate(value, max) {
  const str = clean(value);
  if (str.length <= max) {
    return str;
  }
  return `${str.slice(0, Math.max(0, max - 1))}…`;
}

module.exports = {
  clean,
  isNonEmpty,
  truncate,
};

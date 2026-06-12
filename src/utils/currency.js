'use strict';

/**
 * Currency code helpers.
 */

/**
 * Normalize a currency code to the canonical uppercase form.
 * Returns an empty string for nullish input so callers can validate.
 * @param {*} code
 * @returns {string}
 */
function normalize(code) {
  if (typeof code !== 'string') {
    return '';
  }
  return code.trim().toUpperCase();
}

module.exports = {
  normalize,
};

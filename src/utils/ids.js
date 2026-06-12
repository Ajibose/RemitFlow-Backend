'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Identifier helpers.
 * Wraps uuid so the rest of the app does not depend on it directly.
 */

/**
 * Generate a generic unique identifier.
 * @returns {string}
 */
function newId() {
  return uuidv4();
}

/**
 * Generate a prefixed identifier, e.g. "txn_<uuid>".
 * @param {string} prefix - short namespace for the id.
 * @returns {string}
 */
function prefixedId(prefix) {
  return `${prefix}_${uuidv4()}`;
}

module.exports = {
  newId,
  prefixedId,
};

'use strict';

/**
 * Wrap an async route handler so that rejected promises are
 * forwarded to Express' error handling middleware instead of
 * crashing the process.
 * @param {Function} fn - async (req, res, next) handler.
 * @returns {Function}
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;

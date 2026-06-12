'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Generic validation middleware factory.
 * Accepts a validator function that receives the request and returns
 * an array of error strings. If any errors are found a 400 is raised.
 *
 * @param {(req: import('express').Request) => string[]} validator
 * @returns {import('express').RequestHandler}
 */
function validate(validator) {
  return function validateMiddleware(req, res, next) {
    const errors = validator(req) || [];
    if (errors.length > 0) {
      return next(ApiError.badRequest('Validation failed', { errors }));
    }
    return next();
  };
}

module.exports = validate;

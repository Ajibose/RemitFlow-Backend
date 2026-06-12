'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Translate body-parser JSON syntax errors into a clean 400 response.
 * Express raises a SyntaxError with a `body` property when the request
 * payload is not valid JSON; without this the client would get a stack
 * trace via the generic error handler.
 */
// eslint-disable-next-line no-unused-vars
function jsonError(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return next(ApiError.badRequest('Malformed JSON in request body'));
  }
  return next(err);
}

module.exports = jsonError;

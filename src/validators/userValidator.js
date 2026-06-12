'use strict';

/** Very small email shape check (good enough for a demo). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the body for POST /api/users.
 * @param {import('express').Request} req
 * @returns {string[]} list of error messages.
 */
function validateCreateUser(req) {
  const errors = [];
  const body = req.body || {};
  const { name, email } = body;

  if (!name || typeof name !== 'string') {
    errors.push('name is required');
  }
  if (!email || typeof email !== 'string') {
    errors.push('email is required');
  } else if (!EMAIL_RE.test(email)) {
    errors.push('email must be a valid email address');
  }

  return errors;
}

module.exports = {
  validateCreateUser,
};

'use strict';

const strings = require('../utils/strings');

/** Very small email shape check (good enough for a demo). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** ISO 3166-1 alpha-2 style country code. */
const COUNTRY_RE = /^[A-Za-z]{2}$/;

const MAX_NAME_LENGTH = 80;

/**
 * Validate the body for POST /api/users.
 * @param {import('express').Request} req
 * @returns {string[]} list of error messages.
 */
function validateCreateUser(req) {
  const errors = [];
  const body = req.body || {};
  const { name, email, country } = body;

  if (!strings.isNonEmpty(name)) {
    errors.push('name is required');
  } else if (strings.clean(name).length > MAX_NAME_LENGTH) {
    errors.push(`name must be at most ${MAX_NAME_LENGTH} characters`);
  }
  if (!email || typeof email !== 'string') {
    errors.push('email is required');
  } else if (!EMAIL_RE.test(email)) {
    errors.push('email must be a valid email address');
  }
  if (country !== undefined && country !== null && !COUNTRY_RE.test(String(country))) {
    errors.push('country must be a two-letter country code');
  }

  return errors;
}

module.exports = {
  validateCreateUser,
};

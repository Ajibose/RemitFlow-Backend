'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Minimal in-memory rate limiter.
 * Tracks request counts per client (by IP) within a fixed time window.
 * Counters live only in process memory, which is fine for a single-node
 * demo; a real deployment would use a shared store such as Redis.
 *
 * @param {object} [options]
 * @param {number} [options.windowMs] - length of the window in milliseconds.
 * @param {number} [options.max] - max requests allowed per window per client.
 * @returns {import('express').RequestHandler}
 */
function rateLimit(options = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 100;
  const hits = new Map();

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const key = req.ip || 'unknown';
    let entry = hits.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return next(
        ApiError.tooManyRequests('Too many requests, please try again later', {
          retryAfter,
        })
      );
    }

    return next();
  };
}

module.exports = rateLimit;

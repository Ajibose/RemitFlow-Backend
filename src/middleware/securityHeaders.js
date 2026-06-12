'use strict';

/**
 * Apply a small set of conservative security response headers.
 * Kept dependency-free (no helmet) since the API serves JSON only.
 * These mitigate MIME sniffing, clickjacking and referrer leakage.
 */
function securityHeaders(req, res, next) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-DNS-Prefetch-Control', 'off');
  res.set('Referrer-Policy', 'no-referrer');
  // The API never serves HTML; lock down everything by default.
  res.set('Content-Security-Policy', "default-src 'none'");
  next();
}

module.exports = securityHeaders;

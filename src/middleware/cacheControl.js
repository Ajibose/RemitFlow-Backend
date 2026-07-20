'use strict';

/**
 * Cache-Control middleware builder.
 *
 * @param {object} [options]
 * @param {string} [options.policy] - 'no-store', 'public', or 'private'
 * @param {number} [options.maxAge] - max-age in seconds (if policy is 'public' or 'private')
 * @returns {import('express').RequestHandler}
 */
function cacheControl(options = {}) {
  const policy = options.policy || 'no-store';
  const maxAge = options.maxAge !== undefined ? options.maxAge : 0;

  return function cacheControlMiddleware(req, res, next) {
    if (policy === 'no-store') {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    } else if (policy === 'public') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      res.removeHeader('Pragma');
      const expiresDate = new Date(Date.now() + maxAge * 1000);
      res.set('Expires', expiresDate.toUTCString());
    } else if (policy === 'private') {
      res.set('Cache-Control', `private, max-age=${maxAge}`);
      res.removeHeader('Pragma');
      const expiresDate = new Date(Date.now() + maxAge * 1000);
      res.set('Expires', expiresDate.toUTCString());
    }
    next();
  };
}

module.exports = cacheControl;

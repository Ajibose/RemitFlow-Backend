'use strict';

/**
 * Minimal timestamped console logger.
 * Kept dependency-free so it can be used anywhere in the app.
 */
function format(level, args) {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level}]`, ...args];
}

/**
 * Render a flat object of structured fields as `key=value` pairs.
 * Skips undefined values and wraps strings containing spaces in quotes.
 * @param {object} fields
 * @returns {string}
 */
function fields(obj = {}) {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const str = String(value);
      return str.includes(' ') ? `${key}="${str}"` : `${key}=${str}`;
    })
    .join(' ');
}

const logger = {
  info(...args) {
    console.log(...format('INFO', args));
  },
  warn(...args) {
    console.warn(...format('WARN', args));
  },
  error(...args) {
    console.error(...format('ERROR', args));
  },
  debug(...args) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...format('DEBUG', args));
    }
  },
  fields,
};

module.exports = logger;

'use strict';

/**
 * Minimal timestamped console logger.
 * Kept dependency-free so it can be used anywhere in the app.
 */
function format(level, args) {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level}]`, ...args];
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
};

module.exports = logger;

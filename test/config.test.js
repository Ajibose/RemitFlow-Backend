'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

test('config loads default database connection pooling options', () => {
  // Clear require cache for the config module to load it fresh
  delete require.cache[require.resolve('../src/config')];
  const config = require('../src/config');

  assert.ok(config.db);
  assert.ok(config.db.pool);
  assert.equal(config.db.pool.min, 2);
  assert.equal(config.db.pool.max, 10);
  assert.equal(config.db.pool.idleTimeoutMs, 30000);
  assert.equal(config.db.pool.connectionTimeoutMs, 2000);
});

test('config respects database environment variables', () => {
  const originalEnv = {
    DB_POOL_MIN: process.env.DB_POOL_MIN,
    DB_POOL_MAX: process.env.DB_POOL_MAX,
    DB_POOL_IDLE_TIMEOUT_MS: process.env.DB_POOL_IDLE_TIMEOUT_MS,
    DB_POOL_CONNECTION_TIMEOUT_MS: process.env.DB_POOL_CONNECTION_TIMEOUT_MS,
  };

  try {
    process.env.DB_POOL_MIN = '5';
    process.env.DB_POOL_MAX = '20';
    process.env.DB_POOL_IDLE_TIMEOUT_MS = '15000';
    process.env.DB_POOL_CONNECTION_TIMEOUT_MS = '5000';

    delete require.cache[require.resolve('../src/config')];
    const config = require('../src/config');

    assert.equal(config.db.pool.min, 5);
    assert.equal(config.db.pool.max, 20);
    assert.equal(config.db.pool.idleTimeoutMs, 15000);
    assert.equal(config.db.pool.connectionTimeoutMs, 5000);
  } finally {
    // Restore environment variables
    for (const key of Object.keys(originalEnv)) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
    delete require.cache[require.resolve('../src/config')];
  }
});

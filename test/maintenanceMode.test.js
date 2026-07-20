'use strict';

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

/**
 * Tests for the maintenance-mode middleware (issue #39).
 *
 * The middleware reads config.maintenanceMode on every call so we can
 * toggle it during tests by mutating the config object directly and
 * then restoring it afterwards.
 */

// Load the config once; we mutate it per test and restore afterwards.
const config = require('../src/config');
const maintenanceMode = require('../src/middleware/maintenanceMode');

/** Create a minimal mock request object. */
function makeReq(path = '/api/transfers') {
  return { path };
}

/** Create a minimal mock response object (unused in unit tests). */
function makeRes() {
  return {};
}

/** Run the middleware synchronously and return the error forwarded to next(), or null. */
function runMiddleware(req) {
  let captured = null;
  maintenanceMode(req, makeRes(), (err) => {
    captured = err || null;
  });
  return captured;
}

// ─── isEnabled ───────────────────────────────────────────────────────────────

test('isEnabled returns false when maintenanceMode is false', () => {
  config.maintenanceMode = false;
  assert.equal(maintenanceMode.isEnabled(), false);
});

test('isEnabled returns true when maintenanceMode is true', () => {
  config.maintenanceMode = true;
  assert.equal(maintenanceMode.isEnabled(), true);
  config.maintenanceMode = false;
});

// ─── Maintenance mode OFF ─────────────────────────────────────────────────────

test('passes all requests through when maintenance mode is off', () => {
  config.maintenanceMode = false;
  const err = runMiddleware(makeReq('/api/transfers'));
  assert.equal(err, null);
});

// ─── Maintenance mode ON ──────────────────────────────────────────────────────

test('blocks /api/transfers with 503 when maintenance mode is on', () => {
  config.maintenanceMode = true;

  const err = runMiddleware(makeReq('/api/transfers'));

  assert.ok(err, 'expected an error to be forwarded');
  assert.equal(err.statusCode, 503);
  assert.match(err.message, /maintenance/i);
  assert.equal(err.details.maintenanceMode, true);

  config.maintenanceMode = false;
});

test('blocks /api/users with 503 when maintenance mode is on', () => {
  config.maintenanceMode = true;

  const err = runMiddleware(makeReq('/api/users'));
  assert.ok(err);
  assert.equal(err.statusCode, 503);

  config.maintenanceMode = false;
});

test('allows /api/health through when maintenance mode is on', () => {
  config.maintenanceMode = true;

  const err = runMiddleware(makeReq('/api/health'));
  assert.equal(err, null);

  config.maintenanceMode = false;
});

test('allows /api/health/live through when maintenance mode is on', () => {
  config.maintenanceMode = true;

  const err = runMiddleware(makeReq('/api/health/live'));
  assert.equal(err, null);

  config.maintenanceMode = false;
});

test('allows /api/health/ready through when maintenance mode is on', () => {
  config.maintenanceMode = true;

  const err = runMiddleware(makeReq('/api/health/ready'));
  assert.equal(err, null);

  config.maintenanceMode = false;
});

test('allows /api/version through when maintenance mode is on', () => {
  config.maintenanceMode = true;

  const err = runMiddleware(makeReq('/api/version'));
  assert.equal(err, null);

  config.maintenanceMode = false;
});

test('blocks the root "/" path with 503 when maintenance mode is on', () => {
  config.maintenanceMode = true;

  const err = runMiddleware(makeReq('/'));
  assert.ok(err);
  assert.equal(err.statusCode, 503);

  config.maintenanceMode = false;
});

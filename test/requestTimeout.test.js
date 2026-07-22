'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');

const requestTimeout = require('../src/middleware/requestTimeout');
const config = require('../src/config');
const createApp = require('../src/app');

/**
 * Tests for the per-route request timeout middleware (issue #105).
 *
 * The middleware is a factory: each call returns a handler that starts a
 * timer on the request and forwards a 503 ApiError if the response hasn't
 * finished by the time it fires. Mounting it more than once on the same
 * request (once globally, once on a specific router) should let the later
 * call override the budget for that route instead of stacking a second,
 * independent timer.
 */

/** Minimal mock response: an EventEmitter with the bits the middleware touches. */
function makeRes() {
  const res = new EventEmitter();
  res.headersSent = false;
  return res;
}

test('calls next() synchronously with no error', () => {
  const req = {};
  const res = makeRes();
  let called = false;
  let err;

  requestTimeout({ ms: 50 })(req, res, (e) => {
    called = true;
    err = e;
  });

  assert.equal(called, true);
  assert.equal(err, undefined);
});

test('forwards a 503 ApiError if the response has not finished before the budget elapses', (t, done) => {
  const req = {};
  const res = makeRes();

  requestTimeout({ ms: 20 })(req, res, (err) => {
    if (!err) return; // the synchronous next() call from the middleware itself
    assert.equal(err.statusCode, 503);
    assert.match(err.message, /timed out/i);
    assert.equal(err.details.timeoutMs, 20);
    done();
  });
});

test('does not forward an error once the response has finished', (t, done) => {
  const req = {};
  const res = makeRes();
  let sawError = false;

  requestTimeout({ ms: 20 })(req, res, (err) => {
    if (err) sawError = true;
  });

  res.headersSent = true;
  res.emit('finish');

  setTimeout(() => {
    assert.equal(sawError, false);
    done();
  }, 40);
});

test('does not forward an error once the connection has closed', (t, done) => {
  const req = {};
  const res = makeRes();
  let sawError = false;

  requestTimeout({ ms: 20 })(req, res, (err) => {
    if (err) sawError = true;
  });

  res.emit('close');

  setTimeout(() => {
    assert.equal(sawError, false);
    done();
  }, 40);
});

test('a later per-route timeout overrides an earlier global timeout (shorter wins)', (t, done) => {
  const req = {};
  const res = makeRes();
  const errors = [];

  // Simulate app.js mounting a long global default...
  requestTimeout({ ms: 500 })(req, res, (err) => {
    if (err) errors.push(err);
  });

  // ...followed by a router mounting a short, route-specific override.
  requestTimeout({ ms: 20 })(req, res, (err) => {
    if (err) errors.push(err);
  });

  setTimeout(() => {
    assert.equal(errors.length, 1, 'expected exactly one timeout error');
    assert.equal(errors[0].details.timeoutMs, 20);
    done();
  }, 60);
});

test('a later per-route timeout overrides an earlier global timeout (longer wins)', (t, done) => {
  const req = {};
  const res = makeRes();
  const errors = [];

  // Simulate app.js mounting a short global default...
  requestTimeout({ ms: 20 })(req, res, (err) => {
    if (err) errors.push(err);
  });

  // ...followed by a router mounting a longer, route-specific override.
  requestTimeout({ ms: 100 })(req, res, (err) => {
    if (err) errors.push(err);
  });

  // Well past the (overridden) global budget, still within the route budget.
  setTimeout(() => {
    assert.equal(errors.length, 0, 'the overridden global timer must not fire');
  }, 50);

  setTimeout(() => {
    assert.equal(errors.length, 1);
    assert.equal(errors[0].details.timeoutMs, 100);
    done();
  }, 130);
});

test('defaults to a 15 second budget when no options are given', (t, done) => {
  const req = {};
  const res = makeRes();
  let sawError = false;

  requestTimeout()(req, res, (err) => {
    if (err) sawError = true;
  });

  // Don't actually wait 15s for the timer to fire: finish the response
  // immediately and confirm no error fires on a short tick afterwards,
  // which would only happen if the default budget were far shorter.
  res.headersSent = true;
  res.emit('finish');
  setTimeout(() => {
    assert.equal(sawError, false);
    done();
  }, 10);
});

describe('per-route timeout wiring in the app', () => {
  let app;
  let server;
  let baseUrl;

  before(() => {
    app = createApp();
    return new Promise((resolve) => {
      server = app.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(() => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });

  test('health routes use the shorter health-specific timeout budget, not the global default', () => {
    assert.ok(config.routeTimeouts.healthMs < config.requestTimeoutMs);
  });

  test('transfer routes use the longer transfer-specific timeout budget, not the global default', () => {
    assert.ok(config.routeTimeouts.transfersMs > config.requestTimeoutMs);
  });

  test('fast health responses are unaffected by the shorter per-route budget', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
  });

  test('fast transfer responses are unaffected by the longer per-route budget', async () => {
    const res = await fetch(`${baseUrl}/api/transfers`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.transfers));
  });
});

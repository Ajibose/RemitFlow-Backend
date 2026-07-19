'use strict';

const { test, mock } = require('node:test');
const assert = require('node:assert/strict');

const errorTracking = require('../src/services/errorTrackingService');

test('captureError does not throw when tracking is disabled', async () => {
  const config = require('../src/config');
  const prev = config.errorTracking.enabled;
  config.errorTracking.enabled = false;

  const err = new Error('test');
  await assert.doesNotReject(errorTracking.captureError(err));

  config.errorTracking.enabled = prev;
});

test('captureError accepts an error without a request object', async () => {
  const config = require('../src/config');
  const prev = config.errorTracking.enabled;
  config.errorTracking.enabled = true;

  const err = new Error('standalone error');
  await assert.doesNotReject(errorTracking.captureError(err));

  config.errorTracking.enabled = prev;
});

test('captureError accepts an error with a partial request object', async () => {
  const config = require('../src/config');
  const prev = config.errorTracking.enabled;
  config.errorTracking.enabled = true;

  const err = new Error('request error');
  const req = { id: 'req-123', method: 'POST', url: '/api/transfers' };

  await assert.doesNotReject(errorTracking.captureError(err, req));

  config.errorTracking.enabled = prev;
});

test('captureError handles errors with statusCode and details', async () => {
  const config = require('../src/config');
  const prev = config.errorTracking.enabled;
  config.errorTracking.enabled = true;

  const err = new Error('validation failed');
  err.statusCode = 400;
  err.details = { field: 'amount' };
  const req = { id: 'req-456', method: 'GET', url: '/api/quote' };

  await assert.doesNotReject(errorTracking.captureError(err, req));

  config.errorTracking.enabled = prev;
});

test('captureError does not throw if the envelope contains no request', async () => {
  const config = require('../src/config');
  const prev = config.errorTracking.enabled;
  config.errorTracking.enabled = true;

  const err = new Error('bare error');
  await assert.doesNotReject(errorTracking.captureError(err));

  config.errorTracking.enabled = prev;
});

test('captureError tolerates a transport that throws', async () => {
  const config = require('../src/config');
  const prevEnabled = config.errorTracking.enabled;
  const prevConsole = console.error;
  config.errorTracking.enabled = true;
  console.error = () => { throw new Error('transport down'); };

  const err = new Error('will this crash?');
  await assert.doesNotReject(errorTracking.captureError(err));

  config.errorTracking.enabled = prevEnabled;
  console.error = prevConsole;
});

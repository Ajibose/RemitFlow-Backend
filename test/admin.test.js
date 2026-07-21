'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const createApp = require('../src/app');
const config = require('../src/config');

test('admin diagnostics endpoint', async (t) => {
  const app = createApp();
  const server = http.createServer(app);

  // Start server on an ephemeral port (port 0)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api`;

  t.after(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  await t.test('returns 401 Unauthorized when x-admin-token is missing', async () => {
    const res = await fetch(`${baseUrl}/admin/diagnostics`);
    assert.equal(res.status, 401);

    const body = await res.json();
    assert.ok(body.error);
    assert.equal(body.error.message, 'Unauthorized');
  });

  await t.test('returns 401 Unauthorized when x-admin-token is incorrect', async () => {
    const res = await fetch(`${baseUrl}/admin/diagnostics`, {
      headers: {
        'X-Admin-Token': 'wrong-token',
      },
    });
    assert.equal(res.status, 401);

    const body = await res.json();
    assert.ok(body.error);
    assert.equal(body.error.message, 'Unauthorized');
  });

  await t.test('returns 200 OK and diagnostics info with correct X-Admin-Token header', async () => {
    const res = await fetch(`${baseUrl}/admin/diagnostics`, {
      headers: {
        'X-Admin-Token': config.adminApiKey,
      },
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.ok(body.system);
    assert.ok(body.config);
    assert.ok(body.stats);

    assert.equal(body.config.env, config.env);
    assert.equal(body.config.port, config.port);
    assert.equal(typeof body.system.uptime, 'number');
    assert.equal(typeof body.stats.totalUsers, 'number');
  });

  await t.test('returns 200 OK and diagnostics info with correct Authorization Bearer token', async () => {
    const res = await fetch(`${baseUrl}/admin/diagnostics`, {
      headers: {
        'Authorization': `Bearer ${config.adminApiKey}`,
      },
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.ok(body.system);
    assert.ok(body.config);
    assert.ok(body.stats);
  });
});

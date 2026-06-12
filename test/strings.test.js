'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const strings = require('../src/utils/strings');

test('clean trims strings and coerces non-strings to empty', () => {
  assert.equal(strings.clean('  hi  '), 'hi');
  assert.equal(strings.clean(42), '');
  assert.equal(strings.clean(null), '');
});

test('isNonEmpty detects meaningful content', () => {
  assert.equal(strings.isNonEmpty('x'), true);
  assert.equal(strings.isNonEmpty('   '), false);
  assert.equal(strings.isNonEmpty(undefined), false);
});

test('truncate shortens long strings with an ellipsis', () => {
  assert.equal(strings.truncate('hello', 10), 'hello');
  assert.equal(strings.truncate('hello world', 5), 'hell…');
});

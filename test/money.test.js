'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const money = require('../src/utils/money');

test('round limits to two decimal places', () => {
  assert.equal(money.round(1.005), 1.01);
  assert.equal(money.round(2.344), 2.34);
  assert.equal(money.round(10), 10);
});

test('isPositiveAmount accepts positive numbers only', () => {
  assert.equal(money.isPositiveAmount(5), true);
  assert.equal(money.isPositiveAmount('5'), true);
  assert.equal(money.isPositiveAmount(0), false);
  assert.equal(money.isPositiveAmount(-1), false);
  assert.equal(money.isPositiveAmount('abc'), false);
});

test('clamp constrains values to the given range', () => {
  assert.equal(money.clamp(5, 0, 10), 5);
  assert.equal(money.clamp(-3, 0, 10), 0);
  assert.equal(money.clamp(42, 0, 10), 10);
  assert.equal(money.clamp('nope', 1, 10), 1);
});

test('format renders amount with currency code', () => {
  assert.equal(money.format(10, 'USD'), '10.00 USD');
  assert.equal(money.format(2.5, 'EUR'), '2.50 EUR');
});

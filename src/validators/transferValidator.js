'use strict';

const money = require('../utils/money');

/**
 * Validate the body for POST /api/transfers.
 * @param {import('express').Request} req
 * @returns {string[]} list of error messages.
 */
function validateCreateTransfer(req) {
  const errors = [];
  const body = req.body || {};
  const { senderName, recipientName, amount, from, to } = body;

  if (!senderName || typeof senderName !== 'string') {
    errors.push('senderName is required');
  }
  if (!recipientName || typeof recipientName !== 'string') {
    errors.push('recipientName is required');
  }
  if (amount === undefined) {
    errors.push('amount is required');
  } else if (!money.isPositiveAmount(amount)) {
    errors.push('amount must be a positive number');
  }
  if (!from) {
    errors.push('from currency is required');
  }
  if (!to) {
    errors.push('to currency is required');
  }
  if (from && to && from === to) {
    errors.push('from and to currencies must differ');
  }

  return errors;
}

module.exports = {
  validateCreateTransfer,
};

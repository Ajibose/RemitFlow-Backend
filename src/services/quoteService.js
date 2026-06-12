'use strict';

const config = require('../config');
const rateService = require('./rateService');
const money = require('../utils/money');
const ApiError = require('../utils/ApiError');

/**
 * Quote calculation.
 * A quote tells the sender how much the recipient will receive after
 * RemitFlow's fee and the FX conversion are applied.
 */

/**
 * Compute the fee charged on a send amount.
 * Fee is a percentage of the amount plus a small flat component.
 * @param {number} amount - amount in the source currency.
 * @returns {number}
 */
function calculateFee(amount) {
  const percentFee = amount * (config.fee.percent / 100);
  return money.round(percentFee + config.fee.flat);
}

/**
 * Build a full quote for converting `amount` from `from` to `to`.
 * @param {number} amount
 * @param {string} from
 * @param {string} to
 * @returns {object} quote breakdown.
 */
function getQuote(amount, from, to) {
  if (!money.isPositiveAmount(amount)) {
    throw ApiError.badRequest('amount must be a positive number');
  }

  const numericAmount = money.round(Number(amount));
  const fee = calculateFee(numericAmount);
  const amountAfterFee = money.round(numericAmount - fee);
  const rate = rateService.getRate(from, to);
  const receiveAmount = money.round(amountAfterFee * rate);

  return {
    from,
    to,
    sendAmount: numericAmount,
    fee,
    amountAfterFee,
    rate: money.round(rate),
    receiveAmount,
  };
}

module.exports = {
  calculateFee,
  getQuote,
};

'use strict';

const config = require('../config');
const { prefixedId } = require('../utils/ids');
const logger = require('../utils/logger');

/**
 * Mock Stellar integration.
 * Real RemitFlow would submit path payments to the Stellar network.
 * Here we just fabricate deterministic-looking identifiers so the
 * rest of the app can pretend a settlement happened.
 */

/**
 * Pretend to submit a payment to the Stellar network.
 * @param {object} params
 * @param {number} params.amount
 * @param {string} params.currency
 * @returns {{ txHash: string, network: string, ledger: number }}
 */
function submitPayment({ amount, currency }) {
  logger.debug(`Submitting mock Stellar payment of ${amount} ${currency}`);
  return {
    txHash: prefixedId('stellar').replace('stellar_', ''),
    network: config.stellar.network,
    ledger: Math.floor(Date.now() / 1000),
  };
}

/**
 * Generate a mock claimable-balance id used when a recipient claims funds.
 * @returns {string}
 */
function createClaimableBalanceId() {
  return prefixedId('cb');
}

module.exports = {
  submitPayment,
  createClaimableBalanceId,
};

'use strict';

const { store } = require('../store');
const { prefixedId } = require('../utils/ids');
const ApiError = require('../utils/ApiError');
const { TRANSFER_STATUS, TRANSFER_TRANSITIONS } = require('../config/constants');
const quoteService = require('./quoteService');
const stellarService = require('./stellarService');

/**
 * Transfer lifecycle management.
 * A transfer is created in the PENDING state and can either be
 * CLAIMED by the recipient or CANCELLED by the sender.
 */

/**
 * Return all transfers, optionally filtered by status.
 * @param {string} [status]
 * @returns {Array<object>}
 */
function listTransfers(status) {
  let transfers = Array.from(store.transfers.values());
  if (status) {
    transfers = transfers.filter((t) => t.status === status);
  }
  return transfers;
}

/**
 * Get a transfer or throw a 404 if missing.
 * @param {string} id
 * @returns {object}
 */
function getTransferOrThrow(id) {
  const transfer = store.transfers.get(id);
  if (!transfer) {
    throw ApiError.notFound(`Transfer not found: ${id}`);
  }
  return transfer;
}

/**
 * Create a new transfer using a freshly computed quote.
 * @param {object} data
 * @returns {object}
 */
function createTransfer(data) {
  const quote = quoteService.getQuote(data.amount, data.from, data.to);
  const settlement = stellarService.submitPayment({
    amount: quote.sendAmount,
    currency: data.from,
  });

  const transfer = {
    id: prefixedId('txn'),
    senderName: data.senderName,
    recipientName: data.recipientName,
    from: data.from,
    to: data.to,
    sendAmount: quote.sendAmount,
    fee: quote.fee,
    rate: quote.rate,
    receiveAmount: quote.receiveAmount,
    status: TRANSFER_STATUS.PENDING,
    stellar: settlement,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.transfers.set(transfer.id, transfer);
  return transfer;
}

/**
 * Move a transfer to a new status if the transition is allowed.
 * @param {object} transfer
 * @param {string} nextStatus
 * @returns {object}
 */
function transition(transfer, nextStatus) {
  const allowed = TRANSFER_TRANSITIONS[transfer.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw ApiError.conflict(
      `Cannot change transfer from ${transfer.status} to ${nextStatus}`
    );
  }
  transfer.status = nextStatus;
  transfer.updatedAt = new Date().toISOString();
  return transfer;
}

/**
 * Mark a transfer as claimed by the recipient.
 * @param {string} id
 * @returns {object}
 */
function claimTransfer(id) {
  const transfer = getTransferOrThrow(id);
  transition(transfer, TRANSFER_STATUS.CLAIMED);
  transfer.claimableBalanceId = stellarService.createClaimableBalanceId();
  return transfer;
}

/**
 * Cancel a pending transfer.
 * @param {string} id
 * @returns {object}
 */
function cancelTransfer(id) {
  const transfer = getTransferOrThrow(id);
  return transition(transfer, TRANSFER_STATUS.CANCELLED);
}

module.exports = {
  listTransfers,
  getTransferOrThrow,
  createTransfer,
  claimTransfer,
  cancelTransfer,
};

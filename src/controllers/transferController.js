'use strict';

const transferService = require('../services/transferService');

/**
 * Transfer controllers.
 */

/**
 * POST /api/transfers
 * Create a new transfer.
 */
function createTransfer(req, res) {
  const transfer = transferService.createTransfer(req.body);
  res.status(201).json(transfer);
}

/**
 * GET /api/transfers
 * List transfers, optionally filtered by ?status=.
 */
function listTransfers(req, res) {
  const transfers = transferService.listTransfers(req.query.status);
  res.json({ count: transfers.length, transfers });
}

/**
 * GET /api/transfers/:id
 * Fetch a single transfer by id.
 */
function getTransfer(req, res) {
  const transfer = transferService.getTransferOrThrow(req.params.id);
  res.json(transfer);
}

/**
 * POST /api/transfers/:id/claim
 * Mark a transfer as claimed by the recipient.
 */
function claimTransfer(req, res) {
  const transfer = transferService.claimTransfer(req.params.id);
  res.json(transfer);
}

/**
 * POST /api/transfers/:id/cancel
 * Cancel a pending transfer.
 */
function cancelTransfer(req, res) {
  const transfer = transferService.cancelTransfer(req.params.id);
  res.json(transfer);
}

module.exports = {
  createTransfer,
  listTransfers,
  getTransfer,
  claimTransfer,
  cancelTransfer,
};

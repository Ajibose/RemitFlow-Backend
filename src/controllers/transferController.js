'use strict';

const transferService = require('../services/transferService');
const { parsePagination } = require('../utils/pagination');

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
  const all = transferService.listTransfers(req.query.status);
  const { limit, offset } = parsePagination(req.query);
  const transfers = all.slice(offset, offset + limit);
  res.json({ total: all.length, count: transfers.length, limit, offset, transfers });
}

/**
 * GET /api/transfers/stats
 * Return aggregate transfer statistics.
 */
function getStats(req, res) {
  res.json(transferService.getStats());
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
  getStats,
  getTransfer,
  claimTransfer,
  cancelTransfer,
};

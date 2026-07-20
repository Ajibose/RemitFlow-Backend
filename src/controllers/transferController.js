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
  const transfer = transferService.createTransfer(req.body, req.id);
  res.status(201).json(transfer);
}

/**
 * GET /api/transfers
 * List transfers, optionally filtered by ?status= and/or ?q= (name search).
 * Archived transfers are excluded by default; pass ?archived=true to see only archived,
 * or ?archived=all to include both archived and non-archived.
 */
function listTransfers(req, res) {
  const archivedParam = req.query.archived;
  let archived;
  if (archivedParam === 'true') {
    archived = true;
  } else if (archivedParam === 'all') {
    archived = 'all';
  } else {
    archived = false;
  }

  const all = transferService.listTransfers({
    status: req.query.status,
    search: req.query.q,
    archived,
  });
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
  const transfer = transferService.claimTransfer(req.params.id, req.id);
  res.json(transfer);
}

/**
 * POST /api/transfers/:id/cancel
 * Cancel a pending transfer.
 */
function cancelTransfer(req, res) {
  const transfer = transferService.cancelTransfer(req.params.id, req.id);
  res.json(transfer);
}

/**
 * POST /api/transfers/:id/archive
 * Archive a transfer, hiding it from default list results.
 */
function archiveTransfer(req, res) {
  const transfer = transferService.archiveTransfer(req.params.id);
  res.json(transfer);
}

/**
 * POST /api/transfers/:id/unarchive
 * Unarchive a transfer, restoring it to default list results.
 */
function unarchiveTransfer(req, res) {
  const transfer = transferService.unarchiveTransfer(req.params.id);
  res.json(transfer);
}

module.exports = {
  createTransfer,
  listTransfers,
  getStats,
  getTransfer,
  claimTransfer,
  cancelTransfer,
  archiveTransfer,
  unarchiveTransfer,
};

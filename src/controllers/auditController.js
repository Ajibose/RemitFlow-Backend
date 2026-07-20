'use strict';

const auditService = require('../services/auditService');
const { parsePagination } = require('../utils/pagination');

/**
 * Audit log controllers.
 */

/**
 * GET /api/audit
 * Return all audit log entries, newest first, with limit/offset pagination.
 * Supports optional ?resourceId= query param to filter by resource.
 */
function listAuditEntries(req, res) {
  const { resourceId } = req.query;

  const all = resourceId
    ? auditService.getEntriesForResource(resourceId)
    : auditService.getEntries();

  const { limit, offset } = parsePagination(req.query);
  const entries = all.slice(offset, offset + limit);

  res.json({
    total: all.length,
    count: entries.length,
    limit,
    offset,
    entries,
  });
}

module.exports = {
  listAuditEntries,
};

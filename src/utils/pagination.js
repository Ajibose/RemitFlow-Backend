'use strict';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * Parse and clamp pagination query parameters.
 * @param {object} query - typically req.query.
 * @returns {{ limit: number, offset: number }}
 */
function parsePagination(query = {}) {
  let limit = parseInt(query.limit, 10);
  let offset = parseInt(query.offset, 10);

  if (!Number.isFinite(limit) || limit <= 0) {
    limit = DEFAULT_LIMIT;
  }
  limit = Math.min(limit, MAX_LIMIT);

  if (!Number.isFinite(offset) || offset < 0) {
    offset = 0;
  }

  return { limit, offset };
}

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePagination,
};

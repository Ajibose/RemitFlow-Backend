'use strict';

const { newId } = require('../utils/ids');

/**
 * Audit log service.
 *
 * Records an immutable, append-only log of write operations performed
 * against the API. Entries are stored in memory (consistent with the
 * rest of the in-memory store) and are therefore cleared when the
 * process restarts.
 *
 * Supported actions (non-exhaustive, extend as needed):
 *   transfer.created   transfer.claimed   transfer.cancelled
 *   user.created
 *
 * Each entry captures:
 *   id         — unique audit entry id (aud_ prefix)
 *   action     — dot-namespaced action string (e.g. "transfer.created")
 *   resourceId — id of the created / mutated resource
 *   payload    — arbitrary context snapshot (sanitised by the caller)
 *   requestId  — correlation id from the originating HTTP request (optional)
 *   at         — ISO-8601 timestamp of when the entry was recorded
 */

/** @type {Array<object>} */
const auditLog = [];

/**
 * Append a new entry to the audit log.
 *
 * @param {object} params
 * @param {string} params.action     - action identifier (e.g. "transfer.created")
 * @param {string} params.resourceId - id of the affected resource
 * @param {object} [params.payload]  - additional context to record
 * @param {string} [params.requestId]- request correlation id
 * @returns {object} the newly created audit entry
 */
function addEntry({ action, resourceId, payload = {}, requestId } = {}) {
  if (!action) throw new Error('audit.addEntry: action is required');
  if (!resourceId) throw new Error('audit.addEntry: resourceId is required');

  const entry = {
    id: newId(),
    action,
    resourceId,
    payload,
    requestId: requestId || null,
    at: new Date().toISOString(),
  };

  auditLog.push(entry);
  return entry;
}

/**
 * Return all audit entries, newest first.
 * @returns {Array<object>}
 */
function getEntries() {
  return auditLog.slice().reverse();
}

/**
 * Return only the entries for a specific resource id.
 * @param {string} resourceId
 * @returns {Array<object>}
 */
function getEntriesForResource(resourceId) {
  return auditLog.filter((e) => e.resourceId === resourceId).reverse();
}

/**
 * Clear all audit entries. Primarily used in tests and when the store is reset.
 */
function reset() {
  auditLog.length = 0;
}

module.exports = {
  addEntry,
  getEntries,
  getEntriesForResource,
  reset,
};

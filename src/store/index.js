'use strict';

/**
 * Simple in-memory data store.
 * Data lives only for the lifetime of the process; restarting the
 * server clears everything. This keeps the demo dependency-free.
 */
const store = {
  users: new Map(),
  transfers: new Map(),
};

/** Remove all records from the store. Primarily used in tests/seeding. */
function reset() {
  store.users.clear();
  store.transfers.clear();
}

module.exports = {
  store,
  reset,
};

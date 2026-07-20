'use strict';

const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { store, reset } = require('../src/store');
const transferService = require('../src/services/transferService');
const ApiError = require('../src/utils/ApiError');

beforeEach(() => {
  reset();
});

// ============================================================================
// archiveTransfer tests
// ============================================================================

test('archiveTransfer sets archivedAt on a valid transfer', () => {
  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  assert.equal(transfer.archivedAt, null);

  const archived = transferService.archiveTransfer(transfer.id);

  assert.ok(archived.archivedAt);
  assert.equal(typeof archived.archivedAt, 'string');
  assert.ok(new Date(archived.archivedAt).getTime() > 0);
  assert.equal(archived.id, transfer.id);
});

test('archiveTransfer updates updatedAt timestamp', () => {
  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const originalUpdatedAt = transfer.updatedAt;

  // Small delay to ensure timestamp difference
  const before = new Date().toISOString();
  const archived = transferService.archiveTransfer(transfer.id);

  assert.notEqual(archived.updatedAt, originalUpdatedAt);
  assert.ok(archived.updatedAt >= before);
});

test('archiveTransfer is idempotent when transfer is already archived', () => {
  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const firstArchive = transferService.archiveTransfer(transfer.id);
  const firstArchivedAt = firstArchive.archivedAt;

  // Archive again
  const secondArchive = transferService.archiveTransfer(transfer.id);

  assert.equal(secondArchive.archivedAt, firstArchivedAt);
  assert.equal(secondArchive.id, transfer.id);
});

test('archiveTransfer throws ApiError.notFound for non-existent transfer', () => {
  assert.throws(
    () => transferService.archiveTransfer('txn_nonexistent'),
    (err) => {
      return err instanceof ApiError &&
        err.statusCode === 404 &&
        err.message.includes('Transfer not found');
    }
  );
});

test('archiveTransfer works on transfers with any status', () => {
  const pending = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const claimed = transferService.createTransfer({
    senderName: 'Carol',
    recipientName: 'Dave',
    amount: 200,
    from: 'USD',
    to: 'GBP',
  });
  transferService.claimTransfer(claimed.id);

  const cancelled = transferService.createTransfer({
    senderName: 'Eve',
    recipientName: 'Frank',
    amount: 300,
    from: 'EUR',
    to: 'JPY',
  });
  transferService.cancelTransfer(cancelled.id);

  const archivedPending = transferService.archiveTransfer(pending.id);
  const archivedClaimed = transferService.archiveTransfer(claimed.id);
  const archivedCancelled = transferService.archiveTransfer(cancelled.id);

  assert.ok(archivedPending.archivedAt);
  assert.equal(archivedPending.status, 'pending');

  assert.ok(archivedClaimed.archivedAt);
  assert.equal(archivedClaimed.status, 'claimed');

  assert.ok(archivedCancelled.archivedAt);
  assert.equal(archivedCancelled.status, 'cancelled');
});

test('archiveTransfer vacuousness check: fails if guard is removed', () => {
  // This test confirms that if archiveTransfer does not throw on missing transfers,
  // the test suite will catch it. We expect getTransferOrThrow to be called.
  // Vacuousness check: the test above (throws ApiError.notFound) would pass trivially
  // if archiveTransfer returned a hardcoded value without calling getTransferOrThrow.
  // This test documents that expectation.

  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  // If we delete the transfer from the store after creation, archiveTransfer must throw
  store.transfers.delete(transfer.id);

  assert.throws(
    () => transferService.archiveTransfer(transfer.id),
    (err) => err instanceof ApiError && err.statusCode === 404,
    'archiveTransfer must call getTransferOrThrow and throw when transfer is missing'
  );
});

// ============================================================================
// unarchiveTransfer tests
// ============================================================================

test('unarchiveTransfer clears archivedAt on an archived transfer', () => {
  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  transferService.archiveTransfer(transfer.id);
  assert.ok(transfer.archivedAt);

  const unarchived = transferService.unarchiveTransfer(transfer.id);

  assert.equal(unarchived.archivedAt, null);
  assert.equal(unarchived.id, transfer.id);
});

test('unarchiveTransfer updates updatedAt timestamp', () => {
  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  transferService.archiveTransfer(transfer.id);
  const archivedUpdatedAt = transfer.updatedAt;

  const before = new Date().toISOString();
  const unarchived = transferService.unarchiveTransfer(transfer.id);

  assert.notEqual(unarchived.updatedAt, archivedUpdatedAt);
  assert.ok(unarchived.updatedAt >= before);
});

test('unarchiveTransfer throws ApiError.conflict when transfer is not archived', () => {
  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  assert.equal(transfer.archivedAt, null);

  assert.throws(
    () => transferService.unarchiveTransfer(transfer.id),
    (err) => {
      return err instanceof ApiError &&
        err.statusCode === 409 &&
        err.message.includes('Transfer is not archived');
    }
  );
});

test('unarchiveTransfer throws ApiError.notFound for non-existent transfer', () => {
  assert.throws(
    () => transferService.unarchiveTransfer('txn_nonexistent'),
    (err) => {
      return err instanceof ApiError &&
        err.statusCode === 404 &&
        err.message.includes('Transfer not found');
    }
  );
});

test('unarchiveTransfer preserves transfer status', () => {
  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  transferService.claimTransfer(transfer.id);
  assert.equal(transfer.status, 'claimed');

  transferService.archiveTransfer(transfer.id);
  const unarchived = transferService.unarchiveTransfer(transfer.id);

  assert.equal(unarchived.status, 'claimed');
  assert.equal(unarchived.archivedAt, null);
});

test('unarchiveTransfer vacuousness check: fails if conflict guard is removed', () => {
  // Vacuousness check: the test "throws ApiError.conflict when transfer is not archived"
  // would pass trivially if unarchiveTransfer did not check archivedAt.
  // This test confirms the guard is enforced.

  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  // Transfer is not archived; unarchiveTransfer must throw
  assert.throws(
    () => transferService.unarchiveTransfer(transfer.id),
    (err) => err instanceof ApiError && err.statusCode === 409,
    'unarchiveTransfer must throw ApiError.conflict when transfer is not archived'
  );
});

// ============================================================================
// listTransfers archive filtering tests
// ============================================================================

test('listTransfers excludes archived transfers by default', () => {
  const active = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const toArchive = transferService.createTransfer({
    senderName: 'Carol',
    recipientName: 'Dave',
    amount: 200,
    from: 'USD',
    to: 'GBP',
  });

  transferService.archiveTransfer(toArchive.id);

  const list = transferService.listTransfers();

  assert.equal(list.length, 1);
  assert.equal(list[0].id, active.id);
});

test('listTransfers returns only archived transfers when archived=true', () => {
  const active = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const archived1 = transferService.createTransfer({
    senderName: 'Carol',
    recipientName: 'Dave',
    amount: 200,
    from: 'USD',
    to: 'GBP',
  });

  const archived2 = transferService.createTransfer({
    senderName: 'Eve',
    recipientName: 'Frank',
    amount: 300,
    from: 'EUR',
    to: 'JPY',
  });

  transferService.archiveTransfer(archived1.id);
  transferService.archiveTransfer(archived2.id);

  const list = transferService.listTransfers({ archived: true });

  assert.equal(list.length, 2);
  assert.ok(list.find(t => t.id === archived1.id));
  assert.ok(list.find(t => t.id === archived2.id));
  assert.ok(!list.find(t => t.id === active.id));
});

test('listTransfers returns all transfers when archived=all', () => {
  const active = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const archived = transferService.createTransfer({
    senderName: 'Carol',
    recipientName: 'Dave',
    amount: 200,
    from: 'USD',
    to: 'GBP',
  });

  transferService.archiveTransfer(archived.id);

  const list = transferService.listTransfers({ archived: 'all' });

  assert.equal(list.length, 2);
  assert.ok(list.find(t => t.id === active.id));
  assert.ok(list.find(t => t.id === archived.id));
});

test('listTransfers combines archived filter with status filter', () => {
  const pendingActive = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const pendingArchived = transferService.createTransfer({
    senderName: 'Carol',
    recipientName: 'Dave',
    amount: 200,
    from: 'USD',
    to: 'GBP',
  });
  transferService.archiveTransfer(pendingArchived.id);

  const claimedActive = transferService.createTransfer({
    senderName: 'Eve',
    recipientName: 'Frank',
    amount: 300,
    from: 'EUR',
    to: 'JPY',
  });
  transferService.claimTransfer(claimedActive.id);

  const claimedArchived = transferService.createTransfer({
    senderName: 'Grace',
    recipientName: 'Hank',
    amount: 400,
    from: 'GBP',
    to: 'USD',
  });
  transferService.claimTransfer(claimedArchived.id);
  transferService.archiveTransfer(claimedArchived.id);

  // List pending, exclude archived
  const pendingList = transferService.listTransfers({ status: 'pending' });
  assert.equal(pendingList.length, 1);
  assert.equal(pendingList[0].id, pendingActive.id);

  // List claimed, only archived
  const claimedArchivedList = transferService.listTransfers({ status: 'claimed', archived: true });
  assert.equal(claimedArchivedList.length, 1);
  assert.equal(claimedArchivedList[0].id, claimedArchived.id);

  // List all claimed (archived and active)
  const allClaimedList = transferService.listTransfers({ status: 'claimed', archived: 'all' });
  assert.equal(allClaimedList.length, 2);
});

test('listTransfers combines archived filter with search filter', () => {
  const aliceActive = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const aliceArchived = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Carol',
    amount: 200,
    from: 'USD',
    to: 'GBP',
  });
  transferService.archiveTransfer(aliceArchived.id);

  const charlieActive = transferService.createTransfer({
    senderName: 'Charlie',
    recipientName: 'Dave',
    amount: 300,
    from: 'EUR',
    to: 'JPY',
  });

  // Search for Alice, exclude archived
  const searchList = transferService.listTransfers({ search: 'alice' });
  assert.equal(searchList.length, 1);
  assert.equal(searchList[0].id, aliceActive.id);

  // Search for Alice, only archived
  const searchArchivedList = transferService.listTransfers({ search: 'alice', archived: true });
  assert.equal(searchArchivedList.length, 1);
  assert.equal(searchArchivedList[0].id, aliceArchived.id);

  // Search for Alice, include all
  const searchAllList = transferService.listTransfers({ search: 'alice', archived: 'all' });
  assert.equal(searchAllList.length, 2);
});

test('listTransfers vacuousness check: archived filter is enforced', () => {
  // Vacuousness check: the test "excludes archived transfers by default" would
  // pass trivially if listTransfers did not filter archived transfers.
  // This test confirms the filter is applied.

  transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  const archived = transferService.createTransfer({
    senderName: 'Carol',
    recipientName: 'Dave',
    amount: 200,
    from: 'USD',
    to: 'GBP',
  });
  transferService.archiveTransfer(archived.id);

  const defaultList = transferService.listTransfers();
  const archivedList = transferService.listTransfers({ archived: true });

  assert.equal(defaultList.length, 1, 'default list must exclude archived');
  assert.equal(archivedList.length, 1, 'archived=true list must include only archived');
  assert.notEqual(defaultList[0].id, archivedList[0].id, 'lists must contain different transfers');
});

// ============================================================================
// Integration: archive and unarchive round-trip
// ============================================================================

test('archive and unarchive round-trip restores transfer to default list', () => {
  const transfer = transferService.createTransfer({
    senderName: 'Alice',
    recipientName: 'Bob',
    amount: 100,
    from: 'USD',
    to: 'EUR',
  });

  // Initially in default list
  let list = transferService.listTransfers();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, transfer.id);

  // Archive removes from default list
  transferService.archiveTransfer(transfer.id);
  list = transferService.listTransfers();
  assert.equal(list.length, 0);

  const archivedList = transferService.listTransfers({ archived: true });
  assert.equal(archivedList.length, 1);
  assert.equal(archivedList[0].id, transfer.id);

  // Unarchive restores to default list
  transferService.unarchiveTransfer(transfer.id);
  list = transferService.listTransfers();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, transfer.id);

  const archivedListAfter = transferService.listTransfers({ archived: true });
  assert.equal(archivedListAfter.length, 0);
});

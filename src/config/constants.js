'use strict';

/**
 * Shared application constants.
 */

/** Lifecycle states a transfer can be in. */
const TRANSFER_STATUS = {
  PENDING: 'pending',
  CLAIMED: 'claimed',
  CANCELLED: 'cancelled',
};

/**
 * Allowed status transitions. A transfer may only move to a status
 * listed in the array keyed by its current status.
 */
const TRANSFER_TRANSITIONS = {
  [TRANSFER_STATUS.PENDING]: [TRANSFER_STATUS.CLAIMED, TRANSFER_STATUS.CANCELLED],
  [TRANSFER_STATUS.CLAIMED]: [],
  [TRANSFER_STATUS.CANCELLED]: [],
};

module.exports = {
  TRANSFER_STATUS,
  TRANSFER_TRANSITIONS,
};

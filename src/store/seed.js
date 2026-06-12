'use strict';

const userService = require('../services/userService');
const transferService = require('../services/transferService');
const logger = require('../utils/logger');

/**
 * Populate the in-memory store with a little demo data so the API
 * returns something useful immediately after boot.
 */
function seed() {
  const alice = userService.createUser({
    name: 'Alice Sender',
    email: 'alice@example.com',
    country: 'US',
  });

  userService.createUser({
    name: 'Bob Recipient',
    email: 'bob@example.com',
    country: 'IN',
  });

  transferService.createTransfer({
    senderName: alice.name,
    recipientName: 'Bob Recipient',
    amount: 100,
    from: 'USD',
    to: 'INR',
  });

  logger.info('Seeded demo users and transfers');
}

module.exports = seed;

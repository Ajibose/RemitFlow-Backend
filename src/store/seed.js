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

  const carlos = userService.createUser({
    name: 'Carlos Diaz',
    email: 'carlos@example.com',
    country: 'MX',
  });

  userService.createUser({
    name: 'Ada Okoro',
    email: 'ada@example.com',
    country: 'NG',
  });

  transferService.createTransfer({
    senderName: alice.name,
    recipientName: 'Bob Recipient',
    amount: 100,
    from: 'USD',
    to: 'INR',
  });

  transferService.createTransfer({
    senderName: carlos.name,
    recipientName: 'Ada Okoro',
    amount: 250,
    from: 'USD',
    to: 'NGN',
  });

  const claimable = transferService.createTransfer({
    senderName: alice.name,
    recipientName: 'Carlos Diaz',
    amount: 75,
    from: 'EUR',
    to: 'MXN',
  });
  transferService.claimTransfer(claimable.id);

  logger.info('Seeded demo users and transfers');
}

module.exports = seed;

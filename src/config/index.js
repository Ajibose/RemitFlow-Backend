'use strict';

require('dotenv').config();

/**
 * Centralized application configuration.
 * Values are read from environment variables with sensible defaults
 * so the app can boot even without a .env file present.
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  baseCurrency: process.env.DEFAULT_BASE_CURRENCY || 'USD',

  fee: {
    percent: parseFloat(process.env.TRANSFER_FEE_PERCENT) || 1.5,
    flat: parseFloat(process.env.TRANSFER_FEE_FLAT) || 0.3,
  },

  stellar: {
    network: process.env.STELLAR_NETWORK || 'testnet',
  },

  // CORS origin; "*" allows any origin (fine for a public demo API).
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = config;

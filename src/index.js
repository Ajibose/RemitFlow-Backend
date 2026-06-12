'use strict';

const config = require('./config');
const createApp = require('./app');
const seed = require('./store/seed');
const logger = require('./utils/logger');

/**
 * Server bootstrap.
 * Seeds demo data, creates the app and starts listening.
 */
function start() {
  seed();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`RemitFlow backend listening on port ${config.port}`);
    logger.info(`Environment: ${config.env}`);
  });

  // Graceful shutdown on termination signals.
  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();

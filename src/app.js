'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const rateLimit = require('./middleware/rateLimit');
const jsonError = require('./middleware/jsonError');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

/**
 * Build and configure the Express application.
 * Kept separate from the server bootstrap so it can be imported
 * for testing without binding to a port.
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // Core middleware.
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(jsonError);

  // HTTP request logging (morgan in dev, custom logger always).
  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(requestLogger);

  // Basic abuse protection on the API surface.
  app.use('/api', rateLimit(config.rateLimit));

  // API routes.
  app.use('/api', routes);

  // Root welcome route.
  app.get('/', (req, res) => {
    res.json({ name: 'RemitFlow API', docs: '/api/health' });
  });

  // 404 + error handling (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

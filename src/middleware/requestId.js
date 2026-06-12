'use strict';

const { newId } = require('../utils/ids');

/**
 * Attach a unique identifier to every request.
 * Honours an inbound `X-Request-Id` header when present so a caller can
 * correlate logs across services; otherwise a fresh id is generated.
 * The id is exposed on `req.id` and echoed back in the response header.
 */
function requestId(req, res, next) {
  const incoming = req.get('X-Request-Id');
  const id = incoming && incoming.trim() ? incoming.trim() : newId();
  req.id = id;
  res.set('X-Request-Id', id);
  next();
}

module.exports = requestId;

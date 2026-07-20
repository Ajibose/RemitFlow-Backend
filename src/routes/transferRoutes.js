'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const transferController = require('../controllers/transferController');
const { validateCreateTransfer } = require('../validators/transferValidator');

const router = express.Router();

// POST /api/transfers
router.post(
  '/',
  validate(validateCreateTransfer),
  asyncHandler(transferController.createTransfer)
);

// GET /api/transfers
router.get('/', asyncHandler(transferController.listTransfers));

// GET /api/transfers/stats (declared before /:id so it is not captured)
router.get('/stats', asyncHandler(transferController.getStats));

// GET /api/transfers/:id
router.get('/:id', asyncHandler(transferController.getTransfer));

// POST /api/transfers/:id/claim
router.post('/:id/claim', asyncHandler(transferController.claimTransfer));

// POST /api/transfers/:id/cancel
router.post('/:id/cancel', asyncHandler(transferController.cancelTransfer));

// POST /api/transfers/:id/archive
router.post('/:id/archive', asyncHandler(transferController.archiveTransfer));

// POST /api/transfers/:id/unarchive
router.post('/:id/unarchive', asyncHandler(transferController.unarchiveTransfer));

module.exports = router;

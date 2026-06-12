'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const userController = require('../controllers/userController');
const { validateCreateUser } = require('../validators/userValidator');

const router = express.Router();

// GET /api/users
router.get('/', asyncHandler(userController.listUsers));

// GET /api/users/:id
router.get('/:id', asyncHandler(userController.getUser));

// POST /api/users
router.post(
  '/',
  validate(validateCreateUser),
  asyncHandler(userController.createUser)
);

module.exports = router;

'use strict';

const userService = require('../services/userService');

/**
 * User controllers.
 */

/**
 * GET /api/users
 * List all users.
 */
function listUsers(req, res) {
  const users = userService.listUsers();
  res.json({ count: users.length, users });
}

/**
 * GET /api/users/:id
 * Fetch a single user by id.
 */
function getUser(req, res) {
  const user = userService.getUserOrThrow(req.params.id);
  res.json(user);
}

/**
 * POST /api/users
 * Create a new user.
 */
function createUser(req, res) {
  const user = userService.createUser(req.body);
  res.status(201).json(user);
}

module.exports = {
  listUsers,
  getUser,
  createUser,
};

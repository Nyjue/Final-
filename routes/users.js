const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser, validateIdParam } = require('../middleware/validation');

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', validateIdParam, userController.getUserById);

// GET /api/users/:id/dashboard - Get user dashboard
router.get('/:id/dashboard', validateIdParam, userController.getUserDashboard);

// POST /api/users - Create new user (register)
router.post('/', validateUser, userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', validateIdParam, userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', validateIdParam, userController.deleteUser);

module.exports = router;
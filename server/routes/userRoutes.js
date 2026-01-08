const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleBlockUser,
    changeUserPassword,
    updateSubscription
} = require('../controllers/userController');

// All routes in this file are protected and require Admin role
router.use(protect);
router.use(admin);

// Route: /api/users
router.route('/')
    .get(getAllUsers)
    .post(createUser);

// Route: /api/users/:id
router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

// Specific Action Routes
router.put('/:id/block', toggleBlockUser);
router.put('/:id/password', changeUserPassword);
router.put('/:id/subscription', updateSubscription); // New route for the "Save Plan" feature

module.exports = router;

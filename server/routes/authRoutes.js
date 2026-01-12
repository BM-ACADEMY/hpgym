const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword); // New
router.post('/reset-password', resetPassword);


// Protected User Route (Example)
router.get('/profile', protect, (req, res) => {
    res.json(req.user);
});

// Protected Admin Route (Example)
// This route requires both a valid token AND the 'admin' role
router.get('/admin-dashboard', protect, admin, (req, res) => {
    res.json({ message: 'Welcome to the Admin Dashboard' });
});

module.exports = router;
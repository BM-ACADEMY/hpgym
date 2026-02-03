const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    createUser,
    getUserById, 
    updateUser,
    deleteUser,
    toggleBlockUser,
    changeUserPassword,
    updateSubscription,
    getUserHistory,
    getInvoiceById,
    sendSubscriptionReminder, 
    sendSubscriptionWelcome   
} = require('../controllers/userController');

// Public Route
router.get('/invoice/:id', getInvoiceById);

// Protect all routes below
router.use(protect);

// Admin Routes
router.route('/')
    .get(admin, getAllUsers)   
    .post(admin, createUser);  

// User Routes
router.route('/:id')
    .get(getUserById)          
    .put(updateUser)           
    .delete(admin, deleteUser);

// Admin Actions
router.put('/:id/block', admin, toggleBlockUser);
router.put('/:id/subscription', admin, updateSubscription);

// --- WHATSAPP ROUTES ---
router.post('/:id/welcome', admin, sendSubscriptionWelcome);
router.post('/:id/reminder', admin, sendSubscriptionReminder); 

// History & Password
// - Removed 'admin' middleware so users can see their own history
router.get('/:id/history', getUserHistory); 
router.put('/:id/password', changeUserPassword);

module.exports = router;
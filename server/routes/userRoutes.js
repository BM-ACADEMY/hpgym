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
    getUserHistory
} = require('../controllers/userController');

// 1. Protect all routes (User must be logged in)
router.use(protect);

// 2. Admin Only Routes (List all users, Create user manually)
router.route('/')
    .get(admin, getAllUsers)   
    .post(admin, createUser);  

// 3. Public/User Routes (Fetch own profile, Update own profile)
router.route('/:id')
    .get(getUserById)         
    .put(updateUser)          
    .delete(admin, deleteUser);

// 4. Admin Only Actions
router.put('/:id/block', admin, toggleBlockUser);
router.put('/:id/subscription', admin, updateSubscription);

// 5. NEW: Get Subscription History
router.get('/:id/history', admin, getUserHistory);

// 6. Password Change
router.put('/:id/password', changeUserPassword);

module.exports = router;
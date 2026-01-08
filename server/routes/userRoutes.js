const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getAllUsers, updateUser, toggleBlockUser, deleteUser, changeUserPassword, createUser } = require('../controllers/userController');

// All routes protected and admin only
router.use(protect);
router.use(admin);

router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id').put(updateUser).delete(deleteUser);
router.put('/:id/block', toggleBlockUser);
router.put('/:id/password', changeUserPassword);

module.exports = router;
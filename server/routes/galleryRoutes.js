const express = require('express');
const router = express.Router();
const {
    createGalleryItem,
    getGalleryItems,
    deleteGalleryItem,
    updateGalleryItem
} = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/authMiddleware'); // Adjust path to your auth middleware

// Public route to view images
router.get('/', getGalleryItems);

// Protected Admin routes
router.post('/', protect, admin, createGalleryItem);
router.put('/:id', protect, admin, updateGalleryItem);
router.delete('/:id', protect, admin, deleteGalleryItem);

module.exports = router;

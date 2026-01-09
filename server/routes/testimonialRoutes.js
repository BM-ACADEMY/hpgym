const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware'); 
const {
    getTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} = require('../controllers/testimonialController');

// 1. Get My Testimonials (or All if Admin)
router.get('/', protect, getTestimonials);

// 2. Create Testimonial
router.post('/', protect, createTestimonial);

// 3. Update/Delete (Controller handles ownership logic)
router.put('/:id', protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

// Optional: Public single view
router.get('/:id', getTestimonialById);

module.exports = router;
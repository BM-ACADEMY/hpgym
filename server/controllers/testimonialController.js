const Testimonial = require('../models/Testimonial');

// @desc    Get testimonials (Role Based)
// @route   GET /api/testimonials
// @access  Private (Must be logged in to filter by ID)
const getTestimonials = async (req, res) => {
    try {
        let testimonials;

        // CHECK ROLE
        if (req.user.role === 'admin') {
            // Admin sees ALL reviews
            testimonials = await Testimonial.find().sort({ createdAt: -1 });
        } else {
            // User sees ONLY their own reviews
            testimonials = await Testimonial.find({ user: req.user._id }).sort({ createdAt: -1 });
        }

        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private
const createTestimonial = async (req, res) => {
    try {
        const { details } = req.body;

        if (!details) {
            return res.status(400).json({ message: 'Please provide review details' });
        }

        // Create using ID and Name from the logged-in user (req.user)
        const testimonial = await Testimonial.create({
            user: req.user._id,
            name: req.user.name, 
            details
        });

        res.status(201).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private
const updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        // Security Check: Make sure the logged-in user owns this review (or is admin)
        if (testimonial.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to update this review' });
        }

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedTestimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private
const deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        // Security Check
        if (testimonial.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        await testimonial.deleteOne();

        res.status(200).json({ message: 'Testimonial removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Public wrapper if needed for specific ID
const getTestimonialById = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(testimonial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
};
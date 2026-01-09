const mongoose = require('mongoose');

const testimonialSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Links to your User model
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    details: {
        type: String,
        required: [true, 'Please add text']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
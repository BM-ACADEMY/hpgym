const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String, // Stores the path/URL to the image
        required: true,
    },
}, {
    timestamps: true,
});

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;

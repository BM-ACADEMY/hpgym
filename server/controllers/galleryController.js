const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// --- Multer Configuration ---

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure directory exists
        const dir = 'uploads/gallery/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload variable
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    // fileFilter function removed to support "all file formats" as requested
}).single('image'); // Field name in form-data must be 'image'

// --- Helper: Delete File from Local Storage ---
const deleteLocalFile = (filePath) => {
    // Construct the absolute path. Adjust '..' based on your folder structure.
    const absolutePath = path.join(__dirname, '..', filePath);

    fs.unlink(absolutePath, (err) => {
        if (err) console.error("Failed to delete local file:", err);
        else console.log("Local file deleted:", absolutePath);
    });
};

// --- Controllers ---

// @desc    Upload new gallery image
// @route   POST /api/gallery
// @access  Private/Admin
const createGalleryItem = (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: `Multer Error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ message: `Unknown Error: ${err.message}` });
        }

        // Validate if file exists
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { title } = req.body;

        try {
            // Save path relative to root, e.g., "uploads/gallery/image-123.jpg"
            // Note: Standardize path separators for cross-platform compatibility
            const imagePath = req.file.path.replace(/\\/g, "/");

            const galleryItem = await Gallery.create({
                title,
                image: imagePath,
            });

            res.status(201).json(galleryItem);
        } catch (error) {
            // If DB fails, delete the uploaded file to prevent orphans
            deleteLocalFile(req.file.path);
            res.status(500).json({ message: 'Database failed', error: error.message });
        }
    });
};

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
    try {
        const items = await Gallery.find({}).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update gallery image info and/or file
// @route   PUT /api/gallery/:id
// @access  Private/Admin
const updateGalleryItem = (req, res) => {
    upload(req, res, async function (err) {
        if (err) return res.status(500).json({ message: err.message });

        try {
            const item = await Gallery.findById(req.params.id);

            if (!item) {
                // If a new file was uploaded but item not found, delete the new file
                if (req.file) deleteLocalFile(req.file.path);
                return res.status(404).json({ message: 'Gallery item not found' });
            }

            // Update text fields
            item.title = req.body.title || item.title;

            // If a new file is provided
            if (req.file) {
                // 1. Delete the OLD file from filesystem
                deleteLocalFile(item.image);

                // 2. Set the NEW file path
                item.image = req.file.path.replace(/\\/g, "/");
            }

            const updatedItem = await item.save();
            res.json(updatedItem);

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = async (req, res) => {
    try {
        const item = await Gallery.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }

        // 1. Delete file from filesystem
        deleteLocalFile(item.image);

        // 2. Delete from Database
        await item.deleteOne();

        res.json({ message: 'Gallery item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGalleryItem,
    getGalleryItems,
    updateGalleryItem,
    deleteGalleryItem
};

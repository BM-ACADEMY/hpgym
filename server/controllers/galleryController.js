const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// --- Multer Configuration (Same as before) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/gallery/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

// --- Helper: Delete File ---
const deleteLocalFile = (fileUrl) => {
    // We need to extract the relative path from the full URL if it's stored that way
    // Example input: http://localhost:5000/uploads/gallery/image.jpg
    // We need: uploads/gallery/image.jpg
    
    if (!fileUrl) return;

    // Split by 'uploads/' to get the path relative to root
    const parts = fileUrl.split('uploads/');
    if (parts.length < 2) return; // invalid path structure

    const relativePath = 'uploads/' + parts[1];
    const absolutePath = path.join(__dirname, '..', relativePath);

    fs.unlink(absolutePath, (err) => {
        if (err) console.error("Failed to delete local file:", err);
        else console.log("Local file deleted:", absolutePath);
    });
};

// --- Controllers ---

// @desc    Upload new gallery image with FULL URL
const createGalleryItem = (req, res) => {
    upload(req, res, async function (err) {
        if (err) return res.status(500).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

        const { title } = req.body;

        try {
            // 1. Get Base URL (e.g., http://localhost:5000)
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            
            // 2. Standardize file path (uploads/gallery/image.jpg)
            const filePath = req.file.path.replace(/\\/g, "/");

            // 3. Create Full URL
            const fullImageUrl = `${baseUrl}/${filePath}`;

            const galleryItem = await Gallery.create({
                title,
                image: fullImageUrl, // Saving Full URL now
            });

            res.status(201).json(galleryItem);
        } catch (error) {
            deleteLocalFile(req.file ? req.file.path : null);
            res.status(500).json({ message: 'Database failed', error: error.message });
        }
    });
};

// @desc    Update gallery image
const updateGalleryItem = (req, res) => {
    upload(req, res, async function (err) {
        if (err) return res.status(500).json({ message: err.message });

        try {
            const item = await Gallery.findById(req.params.id);
            if (!item) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(404).json({ message: 'Gallery item not found' });
            }

            item.title = req.body.title || item.title;

            if (req.file) {
                // 1. Delete old file using the helper (which now handles URLs)
                deleteLocalFile(item.image);

                // 2. Generate new Full URL
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                const filePath = req.file.path.replace(/\\/g, "/");
                item.image = `${baseUrl}/${filePath}`;
            }

            const updatedItem = await item.save();
            res.json(updatedItem);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

// @desc    Get all items
const getGalleryItems = async (req, res) => {
    try {
        const items = await Gallery.find({}).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete item
const deleteGalleryItem = async (req, res) => {
    try {
        const item = await Gallery.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });

        deleteLocalFile(item.image);
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
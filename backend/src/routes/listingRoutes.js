// Listing Routes Module
// Defines all API endpoints related to listing operations
// All routes are prefixed with /api/listings in the main server file

const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =====================================================
// MULTER CONFIGURATION FOR LISTING MEDIA UPLOADS
// =====================================================

// Define storage directories for uploaded files
// Images go to Database/photo directory
// Videos go to Database/video directory
const photoDir = path.join(__dirname, '../../Database/photo');
const videoDir = path.join(__dirname, '../../Database/video');

// Ensure upload directories exist
// Creates directories if they don't exist to prevent upload errors
if (!fs.existsSync(photoDir)) {
    fs.mkdirSync(photoDir, { recursive: true });
    console.log('Created photo directory:', photoDir);
}
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
    console.log('Created video directory:', videoDir);
}

// Configure multer disk storage
// Determines destination folder and filename for uploaded files
const storage = multer.diskStorage({
    // Destination: Route images to photo folder, videos to video folder
    destination: (req, file, cb) => {
        // Check file MIME type to determine destination
        if (file.mimetype.startsWith('image/')) {
            cb(null, photoDir);
        } else if (file.mimetype.startsWith('video/')) {
            cb(null, videoDir);
        } else {
            cb(new Error('Invalid file type'), null);
        }
    },

    // Filename: Generate unique filename with timestamp to prevent collisions
    // Format: originalname-timestamp.extension
    filename: (req, file, cb) => {
        // Generate unique suffix with timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        // Extract file extension from original filename
        const fileExtension = path.extname(file.originalname);

        // Extract base name without extension
        // Replace spaces with underscores for cleaner filenames
        const baseName = path.basename(file.originalname, fileExtension)
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_-]/g, '');

        // Construct final filename
        const finalFilename = `${baseName}-${uniqueSuffix}${fileExtension}`;
        cb(null, finalFilename);
    }
});

// File filter: Validate uploaded file types
// Only allow specific image and video formats
const fileFilter = (req, file, cb) => {
    // Allowed image MIME types
    const allowedImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    // Allowed video MIME types
    const allowedVideoTypes = [
        'video/mp4',
        'video/webm',
        'video/quicktime'
    ];

    // Combine all allowed types
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    // Check if uploaded file type is allowed
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) are allowed.'), false);
    }
};

// Create multer upload middleware with configuration
// Handles multiple file fields: images (array) and video (single)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        // Maximum file size: 50MB (for videos)
        fileSize: 50 * 1024 * 1024,
        // Maximum number of files: 10 (9 images + 1 video)
        files: 10
    }
});

// Configure upload fields for listing creation
// images: up to 9 image files
// video: up to 1 video file
const listingUpload = upload.fields([
    { name: 'images', maxCount: 9 },
    { name: 'video', maxCount: 1 }
]);

// =====================================================
// ERROR HANDLING MIDDLEWARE FOR MULTER
// =====================================================
// Wraps route handler to catch multer-specific errors
const handleMulterError = (req, res, next) => {
    listingUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum 10MB for images, 50MB for videos.'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Maximum 9 images and 1 video allowed.'
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected field name in upload.'
                });
            }
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            // Other errors (including file filter rejection)
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload failed'
            });
        }
        // No error, proceed to next middleware
        next();
    });
};

// =====================================================
// ROUTE DEFINITIONS
// =====================================================

// GET /api/listings/categories
// Purpose: Fetch all unique categories from database
// Used for: Populating category filter dropdown
// Response: { success: boolean, data: string[], count: number }
router.get('/categories', listingController.getCategories);

// GET /api/listings/price-reference
// Purpose: Fetch price reference data for similar sold items
// Used for: Pricing reference panel in post listing form
// Query Parameters:
//   - category: string - Item category to match
//   - condition: string - Item condition to match
// Response: { success: boolean, data: array of sold items, count: number }
// Privacy: Only returns item info and prices, no seller/buyer details
router.get('/price-reference', listingController.getPriceReference);

// GET /api/listings/user/:userId
// Purpose: Fetch all listings posted by a specific user
// Used for: Seller's own listings management
// Response: { success: boolean, data: array of listings, count: number }
router.get('/user/:userId', listingController.getUserListings);

// GET /api/listings/:listingId
// Purpose: Fetch detailed information about a specific listing
// Used for: Product detail page
// Response: { success: boolean, data: listing object with media }
router.get('/:listingId', listingController.getListingById);

// GET /api/listings
// Purpose: Fetch all active listings with optional filters
// Query Parameters:
//   - searchKeyword: string - Search term for title
//   - category: string - Filter by category
//   - sortBy: string - Sort field (price, expire_date)
//   - sortOrder: string - Sort direction (asc, desc)
// Response: { success: boolean, data: array of listings, count: number }
router.get('/', listingController.getAllListings);

// POST /api/listings/create
// Purpose: Create a new listing with media files
// Authentication: Required (seller must be logged in)
// Content-Type: multipart/form-data
// Request Body:
//   - user_id: number - Seller's UID
//   - title: string - Item title (required, max 150 chars)
//   - category: string - Item category (required)
//   - condition: string - Item condition (required: like_new, good, fair, poor)
//   - description: string - Item description (required)
//   - selling_price: number - Asking price (required)
//   - original_price: number - Original price (optional)
//   - expire_date: string - Listing expiration date (required, YYYY-MM-DD)
//   - condition_details: string - Additional condition details (optional)
//   - images: File[] - Image files (required, at least 1, max 9)
//   - video: File - Video file (optional, max 1)
// Response: { success: boolean, data: { item_id, list_id, media_count } }
// Transaction: Creates Item, Listing, ListingMedia, ListingMedia_Image/Video in single transaction
router.post('/create', handleMulterError, listingController.createListing);

module.exports = router;
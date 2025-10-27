// Image serving routes - allows frontend to access product images from backend
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Middleware to add CORS headers to ALL image requests
router.use((req, res, next) => {
    // Allow requests from any origin for images (public images)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Max-Age', '3600');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Route to serve product images by filename
// Usage: GET /api/images/laptop_stand.jpg
router.get('/:filename', imageController.getImage);

module.exports = router;
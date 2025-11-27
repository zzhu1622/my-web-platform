// Image serving routes - allows frontend to access product images and background images from backend
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Middleware to add CORS headers to ALL image requests
// This ensures images can be loaded from any origin (important for development)
router.use((req, res, next) => {
    // Allow requests from any origin for images (public images)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Max-Age', '3600');

    // Handle preflight OPTIONS requests
    // Browser sends OPTIONS request before actual request to check CORS policy
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Route to serve background images by filename
// Serves images from Database/Background directory
// Usage: GET /api/images/background/Login-BG.jpg
// This route must be defined BEFORE the general :filename route
// Otherwise Express will treat 'background' as a filename
router.get('/background/:filename', imageController.getBackgroundImage);

// Route to serve product images by filename
// Serves images from Database/photo directory
// Usage: GET /api/images/laptop_stand.jpg
router.get('/:filename', imageController.getImage);

module.exports = router;
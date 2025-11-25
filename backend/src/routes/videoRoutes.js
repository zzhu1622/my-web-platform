// Video serving routes - allows frontend to access product videos from backend
// Supports streaming, range requests, and multiple video formats
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Middleware to add CORS headers to ALL video requests
// This ensures video players can access videos from different origins
router.use((req, res, next) => {
    // Allow requests from any origin for videos (public videos)
    // In production, you might want to restrict this to specific domains
    res.header('Access-Control-Allow-Origin', '*');
    
    // Allow common HTTP methods for video requests
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    
    // Allow necessary headers for range requests and content negotiation
    res.header('Access-Control-Allow-Headers', 'Content-Type, Range, Accept');
    
    // Cache CORS preflight response for 1 hour
    res.header('Access-Control-Max-Age', '3600');

    // Handle preflight OPTIONS requests for CORS
    // Browser sends OPTIONS request before actual GET request for cross-origin resources
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Route to serve product videos by filename
// Supports range requests for video streaming and seeking
// Usage: GET /api/videos/product_demo.mp4
// With range support: GET /api/videos/product_demo.mp4 (with Range: bytes=0-1024 header)
router.get('/:filename', videoController.getVideo);

module.exports = router;

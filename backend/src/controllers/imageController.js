// Image controller - handles serving product images and background images from local filesystem
const path = require('path');
const fs = require('fs');

// Helper function to validate filename for security
// Prevents directory traversal attacks by only allowing safe characters
const isValidFilename = (filename) => {
    // Only allow alphanumeric characters, hyphens, underscores, dots, and common image extensions
    return /^[\w\-\.]+$/.test(filename);
};

// Helper function to get content type based on file extension
// Returns appropriate MIME type for the image format
const getContentType = (filename) => {
    const extension = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.bmp': 'image/bmp'
    };
    return mimeTypes[extension] || 'image/jpeg';
};

// Helper function to send image file with proper headers
// Centralizes the file sending logic for reuse across different image routes
const sendImageFile = (res, imagePath, filename) => {
    // Set CORS headers to allow cross-origin requests
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Set content type based on file extension
    const contentType = getContentType(filename);
    res.setHeader('Content-Type', contentType);

    // Set cache headers for browser caching (1 hour)
    res.setHeader('Cache-Control', 'public, max-age=3600');

    console.log('Serving image:', filename, 'Type:', contentType);

    // Send the file to the client
    res.sendFile(imagePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
        } else {
            console.log('Successfully sent image:', filename);
        }
    });
};

// Get product image file and send to client
// Serves images from Database/photo directory
// Usage: GET /api/images/:filename
exports.getImage = async (req, res) => {
    try {
        // Extract filename from URL parameter
        const { filename } = req.params;

        console.log('Product image request for:', filename);

        // Security check: prevent directory traversal attacks
        if (!isValidFilename(filename)) {
            console.log('Invalid filename format:', filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        // Construct full path to image file in Database/photo directory
        // Path: backend/controllers -> backend -> project -> Database/photo
        const imagesDir = path.resolve(__dirname, '../../Database/photo');
        const imagePath = path.join(imagesDir, filename);

        console.log('Full image path:', imagePath);
        console.log('File exists:', fs.existsSync(imagePath));

        // Check if file exists before attempting to serve
        if (!fs.existsSync(imagePath)) {
            console.log('Image file NOT found:', imagePath);
            return res.status(404).json({
                success: false,
                message: 'Image file not found: ' + filename
            });
        }

        // Send the image file with proper headers
        sendImageFile(res, imagePath, filename);

    } catch (error) {
        console.error('Error serving product image:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// Get background image file and send to client
// Serves images from Database/Background directory
// Usage: GET /api/images/background/:filename
exports.getBackgroundImage = async (req, res) => {
    try {
        // Extract filename from URL parameter
        const { filename } = req.params;

        console.log('Background image request for:', filename);

        // Security check: prevent directory traversal attacks
        if (!isValidFilename(filename)) {
            console.log('Invalid filename format:', filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        // Construct full path to image file in Database/Background directory
        // Path: backend/controllers -> backend -> project -> Database/Background
        const backgroundDir = path.resolve(__dirname, '../../../Database/Background');
        const imagePath = path.join(backgroundDir, filename);

        console.log('Full background image path:', imagePath);
        console.log('File exists:', fs.existsSync(imagePath));

        // Check if file exists before attempting to serve
        if (!fs.existsSync(imagePath)) {
            console.log('Background image file NOT found:', imagePath);
            return res.status(404).json({
                success: false,
                message: 'Background image file not found: ' + filename
            });
        }

        // Send the image file with proper headers
        sendImageFile(res, imagePath, filename);

    } catch (error) {
        console.error('Error serving background image:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};
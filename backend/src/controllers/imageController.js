// Image controller - handles serving product images from local filesystem
const path = require('path');
const fs = require('fs');

// Get image file and send to client
exports.getImage = async (req, res) => {
    try {
        // Extract filename from URL parameter
        const { filename } = req.params;

        console.log('Image request for:', filename);

        // Security check: prevent directory traversal attacks
        // Only allow alphanumeric characters, hyphens, underscores, and file extensions
        if (!/^[\w\-\.]+$/.test(filename)) {
            console.log('Invalid filename format:', filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        // Construct full path to image file in Database/photo directory
        // Get the backend directory first
        const backendDir = path.dirname(__dirname);
        const projectDir = path.dirname(backendDir);
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

        // Set CORS headers BEFORE sending file
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        // Set appropriate content-type header based on file extension
        const extension = path.extname(filename).toLowerCase();
        let contentType = 'image/jpeg';

        if (extension === '.png') {
            contentType = 'image/png';
        } else if (extension === '.gif') {
            contentType = 'image/gif';
        } else if (extension === '.webp') {
            contentType = 'image/webp';
        }

        // Set cache and content headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');

        console.log('Serving image:', filename, 'Type:', contentType);

        // Send file with proper headers
        res.sendFile(imagePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            } else {
                console.log('Successfully sent image:', filename);
            }
        });

    } catch (error) {
        console.error('Error serving image:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};
// Video controller - handles serving product videos from local filesystem
// Supports multiple video formats with appropriate MIME types and streaming
const path = require('path');
const fs = require('fs');

// Get video file and send to client with support for range requests
exports.getVideo = async (req, res) => {
    try {
        // Extract video filename from URL parameter
        const { filename } = req.params;

        console.log('Video request for:', filename);

        // Security check: prevent directory traversal attacks
        // Only allow alphanumeric characters, hyphens, underscores, and file extensions
        // This prevents malicious requests like '../../etc/passwd'
        if (!/^[\w\-\.]+$/.test(filename)) {
            console.log('Invalid filename format:', filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        // Construct full path to video file in Database/video directory
        // Use same path pattern as imageController which successfully serves images
        // imageController uses: ../../Database/photo (works perfectly!)
        // videoController uses: ../../Database/video (same structure, same depth)
        const videoDir = path.resolve(__dirname, '../../../Database/video');
        const videoPath = path.join(videoDir, filename);

        console.log('Full video path:', videoPath);
        console.log('File exists:', fs.existsSync(videoPath));

        // Check if file exists before attempting to serve
        if (!fs.existsSync(videoPath)) {
            console.log('Video file NOT found:', videoPath);
            return res.status(404).json({
                success: false,
                message: 'Video file not found: ' + filename
            });
        }

        // Get file statistics for range request support
        // This allows video players to seek through content efficiently
        const fileStats = fs.statSync(videoPath);
        const fileSize = fileStats.size;
        const extension = path.extname(filename).toLowerCase();

        // Determine appropriate MIME type based on file extension
        let contentType = 'video/mp4';

        if (extension === '.webm') {
            contentType = 'video/webm';
        } else if (extension === '.ogv' || extension === '.ogg') {
            contentType = 'video/ogg';
        } else if (extension === '.mov') {
            contentType = 'video/quicktime';
        } else if (extension === '.avi') {
            contentType = 'video/x-msvideo';
        } else if (extension === '.mkv') {
            contentType = 'video/x-matroska';
        }

        // Set CORS headers to allow cross-origin video requests
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Range');

        // Set content-type header for proper video playback
        res.setHeader('Content-Type', contentType);

        // Set Content-Disposition to inline for browser playback in video element
        // 'inline' plays video in browser, 'attachment' would download
        // This is essential for HTML5 <video> element to display video instead of prompting download
        res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');

        // Handle range requests for efficient video streaming
        // This allows video player to seek without downloading entire file
        const range = req.headers.range;

        if (range) {
            // Parse range header (format: bytes=start-end)
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            // Validate range parameters
            if (start >= fileSize || end >= fileSize || start > end) {
                return res.status(416).json({
                    success: false,
                    message: 'Invalid range'
                });
            }

            // Set response headers for partial content
            const chunkSize = end - start + 1;
            res.statusCode = 206;
            res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            res.setHeader('Content-Length', chunkSize);
            res.setHeader('Accept-Ranges', 'bytes');

            // Stream the video chunk to client
            const stream = fs.createReadStream(videoPath, { start, end });
            stream.pipe(res);

            stream.on('error', (err) => {
                console.error('Stream error:', err);
                res.status(500).json({
                    success: false,
                    message: 'Error streaming video'
                });
            });
        } else {
            // No range header: serve entire video file
            res.setHeader('Content-Length', fileSize);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'public, max-age=86400');

            console.log('Serving entire video:', filename, 'Type:', contentType);

            // Send file with headers passed to sendFile method
            // This ensures Content-Type and Content-Disposition headers are actually sent to client
            // Without this, sendFile() might not include the headers we set earlier
            res.sendFile(videoPath, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': 'inline; filename="' + filename + '"'
                }
            }, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                } else {
                    console.log('Successfully sent video:', filename);
                }
            });
        }

    } catch (error) {
        console.error('Error serving video:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};
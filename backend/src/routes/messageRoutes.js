const express = require('express');
const messageController = require('../controllers/messageController');
const multer = require('multer');
const path = require('path');

// Create Express router for message routes
// Router will be mounted at /api/messages in main app
const router = express.Router();

// Configure multer for file uploads (images and videos)
// Files will be stored in Database/message-media directory
const storage = multer.diskStorage({
    // Define destination directory for uploaded files
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../Database/message-media');
        cb(null, uploadDir);
    },
    
    // Define filename format for uploaded files
    // Format: timestamp-originalname (e.g., 1234567890-photo.jpg)
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExtension);
        cb(null, `${baseName}-${uniqueSuffix}${fileExtension}`);
    }
});

// File filter to validate uploaded file types
// Only allow image and video formats
const fileFilter = (req, file, cb) => {
    // Define allowed MIME types for images
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // Define allowed MIME types for videos
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
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
// Limits file size to 50MB for videos and 10MB for images
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB maximum file size
    }
});

// =====================================================
// ROUTE: POST /api/messages/conversation
// =====================================================
// Purpose: Get existing conversation or create new one between buyer and seller
// Request Body:
//   {
//     buyer_uid: number - ID of the buyer (message initiator)
//     seller_uid: number - ID of the seller (message recipient)
//     item_id: number - Optional ID of the item being discussed
//   }
// Response Success (200/201):
//   {
//     success: boolean - true
//     conversation_id: number - ID of conversation
//     is_new: boolean - true if new conversation was created
//   }
// Response Error (400/500):
//   {
//     success: boolean - false
//     message: string - Error description
//   }
// Process:
//   1. Check if conversation already exists between these users
//   2. If exists, return existing conversation ID
//   3. If not, create new conversation and return ID
router.post('/conversation', messageController.getOrCreateConversation);

// =====================================================
// ROUTE: GET /api/messages/conversation/:conversation_id
// =====================================================
// Purpose: Fetch all messages in a specific conversation
// URL Parameters:
//   conversation_id - ID of the conversation
// Query Parameters:
//   current_user_id - ID of the user requesting messages (for access control)
//   limit - Optional limit on number of messages (default 50)
// Response Success (200):
//   {
//     success: boolean - true
//     messages: array - Array of message objects with media
//     conversation_info: object - Conversation details with participants
//   }
// Response Error (403/404/500):
//   {
//     success: boolean - false
//     message: string - Error description
//   }
// Process:
//   1. Verify conversation exists and user is participant
//   2. Fetch all messages with sender information
//   3. Fetch associated media for each message
//   4. Mark unread messages as read for current user
router.get('/conversation/:conversation_id', messageController.getConversationMessages);

// =====================================================
// ROUTE: POST /api/messages/send
// =====================================================
// Purpose: Send a new text message in a conversation
// Request Body:
//   {
//     conversation_id: number - ID of the conversation
//     sender_uid: number - ID of the user sending the message
//     message_text: string - Content of the message
//   }
// Response Success (201):
//   {
//     success: boolean - true
//     message_id: number - ID of newly created message
//     message: object - Complete message object with sender info
//   }
// Response Error (400/403/500):
//   {
//     success: boolean - false
//     message: string - Error description
//   }
// Process:
//   1. Validate conversation exists and user is participant
//   2. Insert message into Message table
//   3. Update conversation's last_message_at timestamp
//   4. Return newly created message with sender info
router.post('/send', messageController.sendMessage);

// =====================================================
// ROUTE: POST /api/messages/upload-media
// =====================================================
// Purpose: Upload image or video attachment to a message
// Request Body (multipart/form-data):
//   - message_id: number - ID of the message to attach media to
//   - media_type: string - Either 'image' or 'video'
//   - file: file - The uploaded image or video file
// Response Success (201):
//   {
//     success: boolean - true
//     media_id: number - ID of created media record
//     media_url: string - URL to access the uploaded media
//     thumbnail_url: string - URL to thumbnail (for videos)
//     media_type: string - Type of media ('image' or 'video')
//   }
// Response Error (400/404/500):
//   {
//     success: boolean - false
//     message: string - Error description
//   }
// Process:
//   1. Validate file type and size using multer
//   2. Save file to disk in message-media directory
//   3. Insert media record into MessageMedia table
//   4. Return media URL for immediate display
router.post('/upload-media', upload.single('file'), messageController.uploadMessageMedia);

// =====================================================
// ROUTE: GET /api/messages/conversations/:user_id
// =====================================================
// Purpose: Fetch all conversations for a specific user
// URL Parameters:
//   user_id - ID of the user
// Response Success (200):
//   {
//     success: boolean - true
//     conversations: array - Array of conversation objects with details
//   }
// Response Error (400/500):
//   {
//     success: boolean - false
//     message: string - Error description
//   }
// Process:
//   1. Fetch all conversations where user is buyer or seller
//   2. Include last message preview
//   3. Include unread message count
//   4. Include other participant's info and online status
router.get('/conversations/:user_id', messageController.getUserConversations);

// =====================================================
// ROUTE: GET /api/messages/online-status/:user_id
// =====================================================
// Purpose: Check if a user is currently online
// URL Parameters:
//   user_id - ID of the user to check
// Response Success (200):
//   {
//     success: boolean - true
//     is_online: boolean - Whether user is currently online
//     last_seen: timestamp - Last activity timestamp
//   }
// Response Error (404/500):
//   {
//     success: boolean - false
//     message: string - Error description
//   }
// Process:
//   1. Query user_online_status view
//   2. Return online status and last_seen timestamp
router.get('/online-status/:user_id', messageController.getOnlineStatus);

module.exports = router;

const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

// Message controller module
// Handles all messaging operations: conversations, messages, media uploads, online status
const messageController = {

    // =====================================================
    // GET OR CREATE CONVERSATION
    // =====================================================
    // HTTP: POST /api/messages/conversation
    // Purpose: Get existing conversation or create new one between buyer and seller
    // Request Body: { buyer_uid: number, seller_uid: number, item_id: number }
    // Response: { success: boolean, conversation_id: number, is_new: boolean }
    // Process:
    //   1. Check if conversation already exists between these users for this item
    //   2. If exists, return existing conversation ID
    //   3. If not exists, create new conversation and return ID
    getOrCreateConversation: async (req, res) => {
        try {
            const { buyer_uid, seller_uid, item_id } = req.body;

            // Validate required fields
            if (!buyer_uid || !seller_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Buyer UID and Seller UID are required'
                });
            }

            // Check for self-messaging (user cannot message themselves)
            if (buyer_uid === seller_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot create conversation with yourself'
                });
            }

            // Get database connection from pool
            const connection = await pool.getConnection();

            try {
                // Check if conversation already exists between these two users
                // Search in both directions (buyer-seller or seller-buyer)
                const checkQuery = `
                    SELECT ConversationID, buyer_uid, seller_uid 
                    FROM Conversation 
                    WHERE ((buyer_uid = ? AND seller_uid = ?) 
                           OR (buyer_uid = ? AND seller_uid = ?))
                    AND (ItemID = ? OR ItemID IS NULL)
                    LIMIT 1
                `;

                const [existingConversations] = await connection.query(checkQuery, [
                    buyer_uid, seller_uid,
                    seller_uid, buyer_uid,
                    item_id
                ]);

                // If conversation exists, return existing conversation ID
                if (existingConversations.length > 0) {
                    connection.release();
                    return res.status(200).json({
                        success: true,
                        conversation_id: existingConversations[0].ConversationID,
                        is_new: false
                    });
                }

                // Create new conversation if none exists
                const insertQuery = `
                    INSERT INTO Conversation (buyer_uid, seller_uid, ItemID, created_at, last_message_at)
                    VALUES (?, ?, ?, NOW(), NOW())
                `;

                const [insertResult] = await connection.query(insertQuery, [
                    buyer_uid,
                    seller_uid,
                    item_id || null
                ]);

                connection.release();

                // Return newly created conversation ID
                return res.status(201).json({
                    success: true,
                    conversation_id: insertResult.insertId,
                    is_new: true
                });

            } catch (error) {
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error in getOrCreateConversation:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get or create conversation',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET CONVERSATION MESSAGES
    // =====================================================
    // HTTP: GET /api/messages/conversation/:conversation_id
    // Purpose: Fetch all messages in a conversation with user and media details
    // URL Parameters: conversation_id - ID of the conversation
    // Query Parameters: limit (optional) - number of messages to fetch (default 50)
    // Response: { success: boolean, messages: array, conversation_info: object }
    // Process:
    //   1. Verify conversation exists and user is participant
    //   2. Fetch all messages with sender information
    //   3. Fetch associated media for each message
    //   4. Mark messages as read if current user is recipient
    getConversationMessages: async (req, res) => {
        try {
            const { conversation_id } = req.params;
            const { limit = 50 } = req.query;
            const current_user_id = req.body.current_user_id || req.query.current_user_id;

            // Validate conversation ID
            if (!conversation_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Conversation ID is required'
                });
            }

            const connection = await pool.getConnection();

            try {
                // Get conversation details and verify user is participant
                const conversationQuery = `
                    SELECT c.*, 
                           buyer.name as buyer_name, buyer.email as buyer_email,
                           seller.name as seller_name, seller.email as seller_email,
                           i.title as item_title, i.selling_price,
                           CASE WHEN buy_status.is_online = 1 THEN 'online' ELSE 'offline' END as buyer_status,
                           CASE WHEN sell_status.is_online = 1 THEN 'online' ELSE 'offline' END as seller_status
                    FROM Conversation c
                    LEFT JOIN User buyer ON c.buyer_uid = buyer.UID
                    LEFT JOIN User seller ON c.seller_uid = seller.UID
                    LEFT JOIN Item i ON c.ItemID = i.ItemID
                    LEFT JOIN user_online_status buy_status ON buyer.UID = buy_status.UID
                    LEFT JOIN user_online_status sell_status ON seller.UID = sell_status.UID
                    WHERE c.ConversationID = ?
                `;

                const [conversations] = await connection.query(conversationQuery, [conversation_id]);

                if (conversations.length === 0) {
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Conversation not found'
                    });
                }

                const conversation = conversations[0];

                // Verify current user is participant in this conversation
                if (current_user_id && 
                    conversation.buyer_uid !== parseInt(current_user_id) && 
                    conversation.seller_uid !== parseInt(current_user_id)) {
                    connection.release();
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied: You are not a participant in this conversation'
                    });
                }

                // Fetch all messages in conversation with sender information
                const messagesQuery = `
                    SELECT m.*, 
                           u.name as sender_name,
                           u.email as sender_email
                    FROM Message m
                    LEFT JOIN User u ON m.sender_uid = u.UID
                    WHERE m.ConversationID = ?
                    ORDER BY m.created_at ASC
                    LIMIT ?
                `;

                const [messages] = await connection.query(messagesQuery, [
                    conversation_id,
                    parseInt(limit)
                ]);

                // Fetch media for all messages in this conversation
                const messagesWithMedia = await Promise.all(messages.map(async (message) => {
                    const mediaQuery = `
                        SELECT * FROM MessageMedia 
                        WHERE MessageID = ? 
                        ORDER BY created_at ASC
                    `;

                    const [media] = await connection.query(mediaQuery, [message.MessageID]);

                    return {
                        ...message,
                        media: media || []
                    };
                }));

                // Mark unread messages as read for current user
                if (current_user_id) {
                    const markReadQuery = `
                        UPDATE Message 
                        SET is_read = TRUE, read_at = NOW() 
                        WHERE ConversationID = ? 
                        AND sender_uid != ? 
                        AND is_read = FALSE
                    `;

                    await connection.query(markReadQuery, [conversation_id, current_user_id]);
                }

                connection.release();

                // Return messages with conversation info
                return res.status(200).json({
                    success: true,
                    messages: messagesWithMedia,
                    conversation_info: {
                        conversation_id: conversation.ConversationID,
                        buyer: {
                            uid: conversation.buyer_uid,
                            name: conversation.buyer_name,
                            email: conversation.buyer_email,
                            status: conversation.buyer_status
                        },
                        seller: {
                            uid: conversation.seller_uid,
                            name: conversation.seller_name,
                            email: conversation.seller_email,
                            status: conversation.seller_status
                        },
                        item: conversation.ItemID ? {
                            item_id: conversation.ItemID,
                            title: conversation.item_title,
                            price: conversation.selling_price
                        } : null,
                        created_at: conversation.created_at,
                        last_message_at: conversation.last_message_at
                    }
                });

            } catch (error) {
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error in getConversationMessages:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch messages',
                error: error.message
            });
        }
    },

    // =====================================================
    // SEND MESSAGE
    // =====================================================
    // HTTP: POST /api/messages/send
    // Purpose: Send a text message in a conversation
    // Request Body: { conversation_id: number, sender_uid: number, message_text: string }
    // Response: { success: boolean, message_id: number, message: object }
    // Process:
    //   1. Validate conversation exists and user is participant
    //   2. Insert message into Message table
    //   3. Update conversation's last_message_at timestamp
    //   4. Return newly created message with sender info
    sendMessage: async (req, res) => {
        try {
            const { conversation_id, sender_uid, message_text } = req.body;

            // Validate required fields
            if (!conversation_id || !sender_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Conversation ID and Sender UID are required'
                });
            }

            // Validate message content (either text or media must be provided)
            if (!message_text || message_text.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Message text cannot be empty'
                });
            }

            const connection = await pool.getConnection();

            try {
                // Verify conversation exists and user is participant
                const verifyQuery = `
                    SELECT * FROM Conversation 
                    WHERE ConversationID = ? 
                    AND (buyer_uid = ? OR seller_uid = ?)
                `;

                const [conversations] = await connection.query(verifyQuery, [
                    conversation_id,
                    sender_uid,
                    sender_uid
                ]);

                if (conversations.length === 0) {
                    connection.release();
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied or conversation not found'
                    });
                }

                // Insert message into Message table
                const insertQuery = `
                    INSERT INTO Message (ConversationID, sender_uid, message_text, created_at, is_read)
                    VALUES (?, ?, ?, NOW(), FALSE)
                `;

                const [insertResult] = await connection.query(insertQuery, [
                    conversation_id,
                    sender_uid,
                    message_text
                ]);

                const messageId = insertResult.insertId;

                // Update conversation's last_message_at timestamp
                const updateConversationQuery = `
                    UPDATE Conversation 
                    SET last_message_at = NOW() 
                    WHERE ConversationID = ?
                `;

                await connection.query(updateConversationQuery, [conversation_id]);

                // Fetch the newly created message with sender information
                const fetchMessageQuery = `
                    SELECT m.*, u.name as sender_name, u.email as sender_email
                    FROM Message m
                    LEFT JOIN User u ON m.sender_uid = u.UID
                    WHERE m.MessageID = ?
                `;

                const [newMessage] = await connection.query(fetchMessageQuery, [messageId]);

                connection.release();

                return res.status(201).json({
                    success: true,
                    message_id: messageId,
                    message: {
                        ...newMessage[0],
                        media: []
                    }
                });

            } catch (error) {
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error in sendMessage:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: error.message
            });
        }
    },

    // =====================================================
    // UPLOAD MESSAGE MEDIA
    // =====================================================
    // HTTP: POST /api/messages/upload-media
    // Purpose: Upload image or video attachment to a message
    // Request Body (multipart/form-data): 
    //   - message_id: number
    //   - media_type: 'image' or 'video'
    //   - file: uploaded file
    // Response: { success: boolean, media_id: number, media_url: string }
    // Process:
    //   1. Validate file type and size
    //   2. Save file to disk in appropriate directory
    //   3. Insert media record into MessageMedia table
    //   4. Return media URL for immediate display
    uploadMessageMedia: async (req, res) => {
        try {
            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const { message_id, media_type } = req.body;
            const file = req.file;

            // Validate required fields
            if (!message_id || !media_type) {
                return res.status(400).json({
                    success: false,
                    message: 'Message ID and media type are required'
                });
            }

            // Validate media type
            if (!['image', 'video'].includes(media_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Media type must be either "image" or "video"'
                });
            }

            // Construct file URL for database storage
            const fileUrl = `/api/message-media/${file.filename}`;
            const thumbnailUrl = media_type === 'video' ? `/api/message-media/thumb_${file.filename}` : fileUrl;

            const connection = await pool.getConnection();

            try {
                // Verify message exists
                const verifyQuery = 'SELECT * FROM Message WHERE MessageID = ?';
                const [messages] = await connection.query(verifyQuery, [message_id]);

                if (messages.length === 0) {
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Message not found'
                    });
                }

                // Calculate file size in KB
                const fileSizeKb = Math.round(file.size / 1024);

                // Insert media record into MessageMedia table
                const insertQuery = `
                    INSERT INTO MessageMedia 
                    (MessageID, media_type, url, thumbnail_url, file_size_kb, created_at)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;

                const [insertResult] = await connection.query(insertQuery, [
                    message_id,
                    media_type,
                    fileUrl,
                    thumbnailUrl,
                    fileSizeKb
                ]);

                connection.release();

                return res.status(201).json({
                    success: true,
                    media_id: insertResult.insertId,
                    media_url: fileUrl,
                    thumbnail_url: thumbnailUrl,
                    media_type: media_type
                });

            } catch (error) {
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error in uploadMessageMedia:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload media',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET USER'S ALL CONVERSATIONS
    // =====================================================
    // HTTP: GET /api/messages/conversations/:user_id
    // Purpose: Fetch all conversations for a specific user
    // URL Parameters: user_id - ID of the user
    // Response: { success: boolean, conversations: array }
    // Process:
    //   1. Fetch all conversations where user is buyer or seller
    //   2. Include last message preview
    //   3. Include unread message count
    //   4. Include other participant's info and online status
    getUserConversations: async (req, res) => {
        try {
            const { user_id } = req.params;

            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const connection = await pool.getConnection();

            try {
                // Fetch all conversations for this user using the database view
                const query = `
                    SELECT 
                        cd.*,
                        CASE 
                            WHEN cd.buyer_uid = ? THEN cd.seller_uid
                            ELSE cd.buyer_uid
                        END as other_user_id,
                        CASE 
                            WHEN cd.buyer_uid = ? THEN cd.seller_name
                            ELSE cd.buyer_name
                        END as other_user_name,
                        CASE 
                            WHEN cd.buyer_uid = ? THEN cd.seller_status
                            ELSE cd.buyer_status
                        END as other_user_status
                    FROM conversation_details cd
                    WHERE cd.buyer_uid = ? OR cd.seller_uid = ?
                    ORDER BY cd.last_message_at DESC
                `;

                const [conversations] = await connection.query(query, [
                    user_id, user_id, user_id, user_id, user_id
                ]);

                connection.release();

                return res.status(200).json({
                    success: true,
                    conversations: conversations
                });

            } catch (error) {
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error in getUserConversations:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch conversations',
                error: error.message
            });
        }
    },

    // =====================================================
    // CHECK SELLER'S ONLINE STATUS
    // =====================================================
    // HTTP: GET /api/messages/online-status/:user_id
    // Purpose: Check if a user is currently online
    // URL Parameters: user_id - ID of the user to check
    // Response: { success: boolean, is_online: boolean, last_seen: timestamp }
    // Process:
    //   1. Query user_online_status view
    //   2. Return online status and last_seen timestamp
    getOnlineStatus: async (req, res) => {
        try {
            const { user_id } = req.params;

            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const connection = await pool.getConnection();

            try {
                // Check user's online status from view
                const query = `
                    SELECT is_online, last_seen 
                    FROM user_online_status 
                    WHERE UID = ?
                `;

                const [result] = await connection.query(query, [user_id]);

                connection.release();

                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                return res.status(200).json({
                    success: true,
                    is_online: result[0].is_online === 1,
                    last_seen: result[0].last_seen
                });

            } catch (error) {
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error in getOnlineStatus:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check online status',
                error: error.message
            });
        }
    }
};

module.exports = messageController;

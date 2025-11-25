// Message Service
// Handles all API calls related to messaging functionality
// Provides methods for conversation management, sending messages, and media uploads

// Base URL for message API endpoints
const API_BASE_URL = 'http://localhost:3000/api/messages';

const messageService = {
    
    // =====================================================
    // GET OR CREATE CONVERSATION
    // =====================================================
    // Purpose: Get existing conversation or create new one between buyer and seller
    // Parameters:
    //   buyerUid: number - ID of the buyer (message initiator)
    //   sellerUid: number - ID of the seller (message recipient)
    //   itemId: number - Optional ID of the item being discussed
    // Returns: Promise<{ success: boolean, conversation_id: number, is_new: boolean }>
    // Usage: Used when user clicks "Message" button on a listing
    async getOrCreateConversation(buyerUid, sellerUid, itemId = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    buyer_uid: buyerUid,
                    seller_uid: sellerUid,
                    item_id: itemId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get or create conversation');
            }

            return {
                success: true,
                conversation_id: data.conversation_id,
                is_new: data.is_new
            };

        } catch (error) {
            console.error('Error in getOrCreateConversation:', error);
            return {
                success: false,
                message: error.message || 'Failed to get or create conversation'
            };
        }
    },

    // =====================================================
    // GET CONVERSATION MESSAGES
    // =====================================================
    // Purpose: Fetch all messages in a specific conversation
    // Parameters:
    //   conversationId: number - ID of the conversation
    //   currentUserId: number - ID of the user requesting messages
    //   limit: number - Optional limit on number of messages (default 50)
    // Returns: Promise<{ success: boolean, messages: array, conversation_info: object }>
    // Usage: Used to load message history when opening a conversation
    async getConversationMessages(conversationId, currentUserId, limit = 50) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/conversation/${conversationId}?current_user_id=${currentUserId}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch messages');
            }

            return {
                success: true,
                messages: data.messages || [],
                conversation_info: data.conversation_info || null
            };

        } catch (error) {
            console.error('Error in getConversationMessages:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch messages',
                messages: [],
                conversation_info: null
            };
        }
    },

    // =====================================================
    // SEND MESSAGE
    // =====================================================
    // Purpose: Send a new text message in a conversation
    // Parameters:
    //   conversationId: number - ID of the conversation
    //   senderUid: number - ID of the user sending the message
    //   messageText: string - Content of the message
    // Returns: Promise<{ success: boolean, message_id: number, message: object }>
    // Usage: Used when user types and sends a message
    async sendMessage(conversationId, senderUid, messageText) {
        try {
            const response = await fetch(`${API_BASE_URL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    sender_uid: senderUid,
                    message_text: messageText
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send message');
            }

            return {
                success: true,
                message_id: data.message_id,
                message: data.message
            };

        } catch (error) {
            console.error('Error in sendMessage:', error);
            return {
                success: false,
                message: error.message || 'Failed to send message'
            };
        }
    },

    // =====================================================
    // UPLOAD MESSAGE MEDIA
    // =====================================================
    // Purpose: Upload image or video attachment to a message
    // Parameters:
    //   messageId: number - ID of the message to attach media to
    //   mediaType: string - Either 'image' or 'video'
    //   file: File - The uploaded image or video file
    // Returns: Promise<{ success: boolean, media_id: number, media_url: string }>
    // Usage: Used when user attaches image or video to message
    async uploadMessageMedia(messageId, mediaType, file) {
        try {
            // Create FormData for multipart file upload
            const formData = new FormData();
            formData.append('message_id', messageId);
            formData.append('media_type', mediaType);
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload-media`, {
                method: 'POST',
                body: formData
                // Note: Don't set Content-Type header for FormData
                // Browser will set it automatically with correct boundary
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload media');
            }

            return {
                success: true,
                media_id: data.media_id,
                media_url: data.media_url,
                thumbnail_url: data.thumbnail_url,
                media_type: data.media_type
            };

        } catch (error) {
            console.error('Error in uploadMessageMedia:', error);
            return {
                success: false,
                message: error.message || 'Failed to upload media'
            };
        }
    },

    // =====================================================
    // GET USER CONVERSATIONS
    // =====================================================
    // Purpose: Fetch all conversations for a specific user
    // Parameters:
    //   userId: number - ID of the user
    // Returns: Promise<{ success: boolean, conversations: array }>
    // Usage: Used to display list of all user's conversations
    async getUserConversations(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/conversations/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch conversations');
            }

            return {
                success: true,
                conversations: data.conversations || []
            };

        } catch (error) {
            console.error('Error in getUserConversations:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch conversations',
                conversations: []
            };
        }
    },

    // =====================================================
    // GET ONLINE STATUS
    // =====================================================
    // Purpose: Check if a user is currently online
    // Parameters:
    //   userId: number - ID of the user to check
    // Returns: Promise<{ success: boolean, is_online: boolean, last_seen: timestamp }>
    // Usage: Used to display online/offline status in message dialog
    async getOnlineStatus(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/online-status/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to check online status');
            }

            return {
                success: true,
                is_online: data.is_online,
                last_seen: data.last_seen
            };

        } catch (error) {
            console.error('Error in getOnlineStatus:', error);
            return {
                success: false,
                message: error.message || 'Failed to check online status',
                is_online: false,
                last_seen: null
            };
        }
    },

    // =====================================================
    // SEND MESSAGE WITH MEDIA
    // =====================================================
    // Purpose: Send a message with text and optional media attachment
    // Parameters:
    //   conversationId: number - ID of the conversation
    //   senderUid: number - ID of the user sending the message
    //   messageText: string - Content of the message
    //   mediaFile: File - Optional image or video file
    //   mediaType: string - Type of media ('image' or 'video')
    // Returns: Promise<{ success: boolean, message: object }>
    // Usage: Convenience method to send message and upload media in one call
    async sendMessageWithMedia(conversationId, senderUid, messageText, mediaFile = null, mediaType = null) {
        try {
            // First, send the text message
            const messageResult = await this.sendMessage(conversationId, senderUid, messageText);

            if (!messageResult.success) {
                return messageResult;
            }

            // If media file is provided, upload it
            if (mediaFile && mediaType) {
                const mediaResult = await this.uploadMessageMedia(
                    messageResult.message_id,
                    mediaType,
                    mediaFile
                );

                if (!mediaResult.success) {
                    // Message was sent but media upload failed
                    // Return success but include warning
                    return {
                        success: true,
                        message: messageResult.message,
                        warning: 'Message sent but media upload failed: ' + mediaResult.message
                    };
                }

                // Add media to message object
                messageResult.message.media = [{
                    MediaID: mediaResult.media_id,
                    media_type: mediaResult.media_type,
                    url: mediaResult.media_url,
                    thumbnail_url: mediaResult.thumbnail_url
                }];
            }

            return {
                success: true,
                message: messageResult.message
            };

        } catch (error) {
            console.error('Error in sendMessageWithMedia:', error);
            return {
                success: false,
                message: error.message || 'Failed to send message with media'
            };
        }
    }
};

export default messageService;

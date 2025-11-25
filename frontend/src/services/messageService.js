// Message Service - API communication for messaging functionality
// Handles all HTTP requests to message endpoints
const API_BASE_URL = 'http://localhost:3000/api/messages';

const messageService = {
  // Get or create a conversation between buyer and seller
  // POST /api/messages/conversation
  // Returns: { success, conversation_id, is_new }
  getOrCreateConversation: async (buyerUid, sellerUid, itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_uid: buyerUid,
          seller_uid: sellerUid,
          item_id: itemId
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      return { success: false, message: error.message };
    }
  },

  // Get all messages in a conversation
  // GET /api/messages/conversation/:conversation_id?current_user_id=X
  // Returns: { success, messages, conversation_info }
  getConversationMessages: async (conversationId, currentUserId, limit = 50) => {
    try {
      // Build query string with current_user_id as query parameter
      const queryParams = new URLSearchParams({
        current_user_id: currentUserId,
        limit: limit
      });

      const response = await fetch(
        `${API_BASE_URL}/conversation/${conversationId}?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getConversationMessages:', error);
      return { success: false, message: error.message };
    }
  },

  // Send a text message
  // POST /api/messages/send
  // Returns: { success, message_id, message }
  sendMessage: async (messageData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { success: false, message: error.message };
    }
  },

  // Upload media (image or video) for a message
  // POST /api/messages/upload
  // Expects FormData with: file, message_id, media_type
  // Returns: { success, media_id, media_url }
  uploadMessageMedia: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
        // Note: Do NOT set Content-Type header for FormData
        // Browser will set it automatically with correct boundary
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in uploadMessageMedia:', error);
      return { success: false, message: error.message };
    }
  },

  // Get all conversations for a user
  // GET /api/messages/conversations/:user_id
  // Returns: { success, conversations }
  getUserConversations: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      return { success: false, message: error.message };
    }
  },

  // Check if a user is currently online
  // GET /api/messages/online-status/:user_id
  // Returns: { success, is_online, last_seen }
  getOnlineStatus: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/online-status/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getOnlineStatus:', error);
      return { success: false, message: error.message };
    }
  }
};

export default messageService;

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with back button and title -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center">
          <!-- Back button -->
          <button
            @click="goBack"
            class="mr-4 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Title -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900">My Messages</h1>
            <p class="text-sm text-gray-500">View all your conversations</p>
          </div>

          <!-- User info -->
          <div class="ml-auto flex items-center">
            <span class="text-sm text-gray-600">{{ user?.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content area: Two-column layout -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow-lg overflow-hidden flex" style="height: calc(100vh - 200px);">

        <!-- Left panel: Conversation list (33% width) -->
        <div class="w-1/3 border-r border-gray-200 flex flex-col">
          <!-- Conversation list header -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <h2 class="text-lg font-semibold text-gray-900">Conversations</h2>
            <p class="text-xs text-gray-500">{{ conversations.length }} total</p>
          </div>

          <!-- Loading state for conversations -->
          <div v-if="loadingConversations" class="flex items-center justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>

          <!-- Empty state -->
          <div v-else-if="conversations.length === 0" class="flex flex-col items-center justify-center p-8 text-center">
            <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-gray-500 font-medium">No conversations yet</p>
            <p class="text-sm text-gray-400 mt-1">Start messaging with other users</p>
          </div>

          <!-- Conversation list (scrollable) -->
          <div v-else class="flex-1 overflow-y-auto">
            <button
              v-for="conversation in conversations"
              :key="conversation.ConversationID"
              @click="selectConversation(conversation)"
              class="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition duration-200 text-left"
              :class="{ 'bg-blue-50 border-l-4 border-l-blue-500': selectedConversation?.ConversationID === conversation.ConversationID }"
            >
              <div class="flex items-start justify-between">
                <!-- User name and online status -->
                <div class="flex items-center space-x-2 flex-1">
                  <span class="font-semibold text-gray-900">{{ conversation.other_user_name }}</span>
                  <span v-if="conversation.other_user_status === 'online'" class="text-green-400 text-xs">●</span>
                </div>

                <!-- Unread badge -->
                <span
                  v-if="conversation.unread_count > 0"
                  class="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5"
                >
                  {{ conversation.unread_count }}
                </span>
              </div>

              <!-- Item title (if exists) -->
              <p v-if="conversation.item_title" class="text-sm text-blue-600 mt-1">
                About: {{ conversation.item_title }}
              </p>

              <!-- Last message preview -->
              <p class="text-sm text-gray-600 mt-1 truncate">
                {{ conversation.last_message_preview || 'No messages yet' }}
              </p>

              <!-- Timestamp -->
              <p class="text-xs text-gray-400 mt-1">
                {{ formatTime(conversation.last_message_at) }}
              </p>
            </button>
          </div>
        </div>

        <!-- Right panel: Message thread (67% width) -->
        <div class="flex-1 flex flex-col">
          <!-- Empty state when no conversation selected -->
          <div v-if="!selectedConversation" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-gray-500 font-medium text-lg">Select a conversation to start messaging</p>
            <p class="text-sm text-gray-400 mt-1">Choose from your conversations on the left</p>
          </div>

          <!-- Message thread when conversation selected -->
          <div v-else class="flex-1 flex flex-col">
            <!-- Message thread header -->
            <div class="p-4 border-b border-gray-200 bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <!-- User avatar placeholder -->
                  <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {{ selectedConversation.other_user_name?.charAt(0).toUpperCase() }}
                  </div>

                  <!-- User info -->
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ selectedConversation.other_user_name }}</h3>
                    <p class="text-xs text-gray-500">
                      <span v-if="selectedConversation.other_user_status === 'online'" class="text-green-500">● Online</span>
                      <span v-else class="text-gray-400">○ Offline</span>
                    </p>
                  </div>
                </div>

                <!-- Item info (if conversation is about an item) -->
                <div v-if="selectedConversation.item_title" class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ selectedConversation.item_title }}</p>
                  <button
                    @click="viewItemListing(selectedConversation.ItemID)"
                    class="text-xs text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>

            <!-- Messages display area (scrollable) -->
            <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <!-- Loading state -->
              <div v-if="loadingMessages" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>

              <!-- Messages -->
              <div
                v-for="message in messages"
                :key="message.MessageID"
                :class="[
                  'flex',
                  message.sender_uid === user?.UID ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                    message.sender_uid === user?.UID
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  ]"
                >
                  <!-- Sender name (for received messages) -->
                  <p
                    v-if="message.sender_uid !== user?.UID"
                    class="text-xs font-semibold text-gray-600 mb-1"
                  >
                    {{ message.sender_name }}
                  </p>

                  <!-- Message text -->
                  <p class="text-sm whitespace-pre-wrap break-words">{{ message.message_text }}</p>

                  <!-- Media attachments -->
                  <div v-if="message.media && message.media.length > 0" class="mt-2 space-y-2">
                    <div v-for="media in message.media" :key="media.MediaID">
                      <!-- Image -->
                      <img
                        v-if="media.media_type === 'image'"
                        :src="getMediaUrl(media.url)"
                        :alt="media.alt_text || 'Image'"
                        class="rounded-lg max-w-full h-auto cursor-pointer"
                        @click="openMediaFullscreen(getMediaUrl(media.url))"
                      />

                      <!-- Video -->
                      <video
                        v-else-if="media.media_type === 'video'"
                        :src="getMediaUrl(media.url)"
                        controls
                        class="rounded-lg max-w-full h-auto"
                      ></video>
                    </div>
                  </div>

                  <!-- Timestamp -->
                  <p class="text-xs mt-1 opacity-75">
                    {{ formatMessageTime(message.created_at) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Product card at bottom (if conversation is about an item) -->
            <div
              v-if="selectedConversation.item_title"
              class="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between"
            >
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ selectedConversation.item_title }}</p>
                <p class="text-lg font-bold text-blue-600">
                  ${{ formatPrice(selectedConversation.selling_price) }}
                </p>
              </div>
              <button
                @click="viewItemListing(selectedConversation.ItemID)"
                class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition duration-200"
              >
                View
              </button>
            </div>

            <!-- Media preview area -->
            <div v-if="selectedMedia" class="p-3 bg-gray-100 border-t border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Media attached</span>
                <button
                  @click="clearMedia"
                  class="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
              <div class="relative">
                <img
                  v-if="selectedMediaType === 'image'"
                  :src="mediaPreviewUrl"
                  class="max-h-32 rounded-lg"
                  alt="Preview"
                />
                <video
                  v-else-if="selectedMediaType === 'video'"
                  :src="mediaPreviewUrl"
                  class="max-h-32 rounded-lg"
                  controls
                ></video>
              </div>
            </div>

            <!-- Message input area -->
            <div class="p-4 bg-white border-t border-gray-200">
              <div class="flex items-end space-x-2">
                <!-- File attach button -->
                <label class="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-200">
                  <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    @change="handleFileSelect"
                    class="hidden"
                  />
                </label>

                <!-- Message input -->
                <textarea
                  v-model="newMessageText"
                  @keydown.enter.exact.prevent="sendMessage"
                  @keydown.shift.enter.prevent="newMessageText += '\n'"
                  placeholder="Type a message..."
                  rows="1"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style="min-height: 48px; max-height: 120px;"
                ></textarea>

                <!-- Send button -->
                <button
                  @click="sendMessage"
                  :disabled="sendingMessage || (!newMessageText.trim() && !selectedMedia)"
                  class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  <span v-if="!sendingMessage">Send</span>
                  <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen media viewer -->
    <div
      v-if="fullscreenMedia"
      @click="closeMediaFullscreen"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    >
      <button
        @click="closeMediaFullscreen"
        class="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img :src="fullscreenMedia" class="max-w-full max-h-full" alt="Fullscreen" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import messageService from '../services/messageService';

// Router instance for navigation
const router = useRouter();

// User data from localStorage
const user = ref(null);

// Conversation data
const conversations = ref([]);
const selectedConversation = ref(null);
const messages = ref([]);

// Loading states
const loadingConversations = ref(false);
const loadingMessages = ref(false);
const sendingMessage = ref(false);

// Message input
const newMessageText = ref('');

// Media handling
const selectedMedia = ref(null);
const selectedMediaType = ref('');
const mediaPreviewUrl = ref('');
const uploadingMedia = ref(false);

// Fullscreen media viewer
const fullscreenMedia = ref(null);

// Message container ref for auto-scrolling
const messageContainer = ref(null);

// Polling interval
let pollingInterval = null;

// Navigate back to home
const goBack = () => {
  router.push('/home');
};

// Load all conversations for current user
const loadConversations = async () => {
  if (!user.value) return;

  loadingConversations.value = true;
  try {
    const response = await messageService.getUserConversations(user.value.UID);
    if (response.success) {
      conversations.value = response.conversations;
    } else {
      console.error('Failed to load conversations:', response.message);
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
  } finally {
    loadingConversations.value = false;
  }
};

// Select a conversation and load its messages
const selectConversation = async (conversation) => {
  selectedConversation.value = conversation;
  await loadMessages(conversation.ConversationID);
};

// Load messages for selected conversation
const loadMessages = async (conversationId) => {
  if (!user.value) return;

  loadingMessages.value = true;
  try {
    const response = await messageService.getConversationMessages(
      conversationId,
      user.value.UID
    );

    if (response.success) {
      messages.value = response.messages || [];

      // Update selected conversation with latest info from response
      if (response.conversation_info) {
        // Merge conversation info into selectedConversation
        selectedConversation.value = {
          ...selectedConversation.value,
          ...response.conversation_info,
          item_title: response.conversation_info.item?.title || selectedConversation.value.item_title,
          selling_price: response.conversation_info.item?.price || selectedConversation.value.selling_price,
          ItemID: response.conversation_info.item?.item_id || selectedConversation.value.ItemID
        };
      }

      // Auto-scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else {
      console.error('Failed to load messages:', response.message);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  } finally {
    loadingMessages.value = false;
  }
};

// Send a text message
const sendMessage = async () => {
  if ((!newMessageText.value.trim() && !selectedMedia.value) || sendingMessage.value) {
    return;
  }

  if (!selectedConversation.value) {
    console.error('No conversation selected');
    return;
  }

  sendingMessage.value = true;

  try {
    // Send text message
    const messageData = {
      conversation_id: selectedConversation.value.ConversationID,
      sender_uid: user.value.UID,
      message_text: newMessageText.value.trim() || ' '
    };

    const response = await messageService.sendMessage(messageData);

    if (response.success) {
      // Clear input
      newMessageText.value = '';

      // Upload media if selected
      if (selectedMedia.value) {
        await uploadMedia(response.message_id);
      }

      // Reload messages
      await loadMessages(selectedConversation.value.ConversationID);

      // Refresh conversation list to update last message
      await loadConversations();
    } else {
      console.error('Failed to send message:', response.message);
      alert('Failed to send message. Please try again.');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message. Please try again.');
  } finally {
    sendingMessage.value = false;
  }
};

// Handle file selection for media upload
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    alert('Please select an image or video file');
    return;
  }

  // Validate file size (10MB for images, 50MB for videos)
  const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxSize) {
    alert(`File size exceeds ${isImage ? '10MB' : '50MB'} limit`);
    return;
  }

  // Store selected media
  selectedMedia.value = file;
  selectedMediaType.value = isImage ? 'image' : 'video';

  // Create preview URL
  mediaPreviewUrl.value = URL.createObjectURL(file);

  // Clear file input
  event.target.value = '';
};

// Clear selected media
const clearMedia = () => {
  if (mediaPreviewUrl.value) {
    URL.revokeObjectURL(mediaPreviewUrl.value);
  }
  selectedMedia.value = null;
  selectedMediaType.value = '';
  mediaPreviewUrl.value = '';
};

// Upload media file for a message
const uploadMedia = async (messageId) => {
  if (!selectedMedia.value) return;

  uploadingMedia.value = true;

  try {
    const formData = new FormData();
    formData.append('file', selectedMedia.value);
    formData.append('message_id', messageId);
    formData.append('media_type', selectedMediaType.value);

    const response = await messageService.uploadMessageMedia(formData);

    if (!response.success) {
      console.error('Failed to upload media:', response.message);
    }

    // Clear media after upload
    clearMedia();
  } catch (error) {
    console.error('Error uploading media:', error);
  } finally {
    uploadingMedia.value = false;
  }
};

// Get full media URL
const getMediaUrl = (relativePath) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  return `http://localhost:3000${relativePath}`;
};

// Open media in fullscreen
const openMediaFullscreen = (url) => {
  fullscreenMedia.value = url;
};

// Close fullscreen media viewer
const closeMediaFullscreen = () => {
  fullscreenMedia.value = null;
};

// Navigate to item listing page
const viewItemListing = (itemId) => {
  if (itemId) {
    router.push(`/listing/${itemId}`);
  }
};

// Scroll to bottom of message container
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// Format timestamp for conversation list (relative time)
const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // difference in seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format timestamp for messages (absolute time)
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Format price safely (handles both string and number)
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';

  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Check if valid number
  if (isNaN(numPrice)) return '0.00';

  return numPrice.toFixed(2);
};

// Start polling for updates
const startPolling = () => {
  // Poll every 3 seconds
  pollingInterval = setInterval(async () => {
    // Refresh conversation list
    await loadConversations();

    // Refresh messages if conversation is selected
    if (selectedConversation.value) {
      await loadMessages(selectedConversation.value.ConversationID);
    }
  }, 3000);
};

// Stop polling
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Watch messages array and auto-scroll on new messages
watch(() => messages.value.length, () => {
  setTimeout(() => {
    scrollToBottom();
  }, 100);
});

// Component lifecycle: on mount
onMounted(async () => {
  // Load user from localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  } else {
    // Redirect to login if no user
    router.push('/login');
    return;
  }

  // Load conversations
  await loadConversations();

  // Start polling for updates
  startPolling();
});

// Component lifecycle: on unmount
onUnmounted(() => {
  // Stop polling
  stopPolling();

  // Clean up media preview URLs
  if (mediaPreviewUrl.value) {
    URL.revokeObjectURL(mediaPreviewUrl.value);
  }
});
</script>

<style scoped>
/* Custom scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Smooth transitions */
.transition {
  transition: all 0.2s ease;
}
</style>

<template>
  <div>
    <!-- Message Dialog Window: Floating chat interface WITHOUT backdrop overlay -->
    <!-- Background page remains bright and visible -->
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="fixed bottom-0 right-8 w-96 bg-white rounded-t-xl shadow-2xl z-50 flex flex-col border-2 border-gray-300"
        style="height: 600px; max-height: 80vh;"
      >
        <!-- Dialog Header: Shows seller info and online status -->
        <div class="bg-blue-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- User avatar circle -->
            <div class="relative">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-semibold text-lg">
                {{ sellerInitial }}
              </div>
              <!-- Online status indicator dot -->
              <div
                v-if="isSellerOnline"
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              ></div>
            </div>

            <!-- Seller name and status -->
            <div>
              <p class="font-semibold text-base">{{ sellerName }}</p>
              <p class="text-xs text-blue-100">
                {{ isSellerOnline ? 'Online' : 'Offline' }}
              </p>
            </div>
          </div>

          <!-- Close button -->
          <button
            @click="closeDialog"
            class="hover:bg-blue-700 rounded-full p-1 transition duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Product Reference Card: Shows item being discussed -->
        <div
          v-if="productInfo"
          class="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition duration-200"
          @click="viewProduct"
        >
          <div class="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
            <img
              v-if="productInfo.image"
              :src="productInfo.image"
              :alt="productInfo.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ productInfo.title }}</p>
            <p class="text-xs text-blue-600 font-medium">${{ productInfo.price }}</p>
          </div>
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <!-- Messages Container: Scrollable area for chat history -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 space-y-3"
        >
          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center h-full">
            <div class="text-gray-500 text-sm">Loading messages...</div>
          </div>

          <!-- Empty state -->
          <div v-else-if="messages.length === 0" class="flex flex-col justify-center items-center h-full text-gray-500">
            <svg class="w-16 h-16 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-sm">No messages yet</p>
            <p class="text-xs mt-1">Start the conversation!</p>
          </div>

          <!-- Message list -->
          <div v-else>
            <div
              v-for="message in messages"
              :key="message.MessageID"
              :class="[
                'flex',
                message.sender_uid === currentUserId ? 'justify-end' : 'justify-start'
              ]"
            >
              <!-- Message bubble -->
              <div
                :class="[
                  'max-w-[75%] rounded-lg px-3 py-2 break-words',
                  message.sender_uid === currentUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                ]"
              >
                <!-- Message text -->
                <p class="text-sm whitespace-pre-wrap">{{ message.message_text }}</p>

                <!-- Message media (images/videos) -->
                <div v-if="message.media && message.media.length > 0" class="mt-2 space-y-2">
                  <div v-for="media in message.media" :key="media.MediaID">
                    <!-- Image display -->
                    <img
                      v-if="media.media_type === 'image'"
                      :src="getMediaUrl(media.url)"
                      :alt="media.alt_text || 'Message image'"
                      class="rounded max-w-full cursor-pointer"
                      @click="openMediaPreview(media)"
                    />

                    <!-- Video display -->
                    <video
                      v-else-if="media.media_type === 'video'"
                      controls
                      class="rounded max-w-full"
                    >
                      <source :src="getMediaUrl(media.url)" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                <!-- Message timestamp -->
                <p
                  :class="[
                    'text-xs mt-1',
                    message.sender_uid === currentUserId ? 'text-blue-200' : 'text-gray-500'
                  ]"
                >
                  {{ formatMessageTime(message.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input Area: Text input and action buttons -->
        <div class="bg-white border-t border-gray-200 p-3">
          <!-- Media preview (when user selects image/video) -->
          <div v-if="selectedMedia" class="mb-2 relative">
            <div class="inline-block relative">
              <!-- Image preview -->
              <img
                v-if="selectedMediaType === 'image'"
                :src="selectedMediaPreview"
                alt="Preview"
                class="max-h-20 rounded border border-gray-300"
              />
              <!-- Video preview -->
              <video
                v-else-if="selectedMediaType === 'video'"
                class="max-h-20 rounded border border-gray-300"
              >
                <source :src="selectedMediaPreview" type="video/mp4" />
              </video>

              <!-- Remove media button -->
              <button
                @click="removeSelectedMedia"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-200"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Input row: Text input and buttons -->
          <div class="flex items-end gap-2">
            <!-- Attach image button -->
            <button
              @click="triggerImageUpload"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200 flex-shrink-0"
              title="Attach image"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            <!-- Attach video button -->
            <button
              @click="triggerVideoUpload"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200 flex-shrink-0"
              title="Attach video"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            <!-- Share product link button -->
            <button
              v-if="productInfo"
              @click="shareProductLink"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200 flex-shrink-0"
              title="Share product link"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>

            <!-- Message text input -->
            <textarea
              v-model="newMessage"
              @keypress.enter.exact.prevent="sendMessage"
              placeholder="Type a message..."
              rows="1"
              class="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            ></textarea>

            <!-- Send button -->
            <button
              @click="sendMessage"
              :disabled="!canSendMessage"
              :class="[
                'p-2 rounded-lg transition duration-200 flex-shrink-0',
                canSendMessage
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
              title="Send message"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <!-- Hidden file inputs for image and video upload -->
          <input
            ref="imageInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            class="hidden"
            @change="handleFileSelect($event, 'image')"
          />
          <input
            ref="videoInput"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            class="hidden"
            @change="handleFileSelect($event, 'video')"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import messageService from '../services/messageService';

// Vue Router instance for navigation
const router = useRouter();

// Component props definition
const props = defineProps({
  // Control visibility of dialog
  isOpen: {
    type: Boolean,
    required: true
  },
  // Seller information
  sellerUid: {
    type: Number,
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  // Current logged-in user ID
  currentUserId: {
    type: Number,
    required: true
  },
  // Optional product information for context
  productInfo: {
    type: Object,
    default: null
    // Structure: { listing_id, item_id, title, price, image }
  }
});

// Component emits definition
const emit = defineEmits(['close', 'product-view']);

// State variables for message dialog
const messages = ref([]);
const newMessage = ref('');
const loading = ref(false);
const conversationId = ref(null);
const isSellerOnline = ref(false);

// Media upload state
const selectedMedia = ref(null);
const selectedMediaType = ref(null);
const selectedMediaPreview = ref(null);

// Refs for DOM elements
const messagesContainer = ref(null);
const imageInput = ref(null);
const videoInput = ref(null);

// Polling interval for checking new messages
let messagePollingInterval = null;

// Computed property: Get first letter of seller name for avatar
const sellerInitial = computed(() => {
  return props.sellerName ? props.sellerName.charAt(0).toUpperCase() : '?';
});

// Computed property: Check if message can be sent (has text or media)
const canSendMessage = computed(() => {
  return (newMessage.value.trim() !== '') || selectedMedia.value !== null;
});

// Watch for dialog open/close to load messages
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await initializeConversation();
    startMessagePolling();
    checkSellerOnlineStatus();
  } else {
    stopMessagePolling();
  }
});

// Function: Initialize conversation when dialog opens
// Creates new conversation or loads existing one
const initializeConversation = async () => {
  loading.value = true;

  try {
    // Get or create conversation between current user and seller
    const convResult = await messageService.getOrCreateConversation(
      props.currentUserId,
      props.sellerUid,
      props.productInfo?.item_id || null
    );

    if (convResult.success) {
      conversationId.value = convResult.conversation_id;

      // Load message history
      await loadMessages();
    } else {
      console.error('Failed to initialize conversation:', convResult.message);
    }
  } catch (error) {
    console.error('Error initializing conversation:', error);
  } finally {
    loading.value = false;
  }
};

// Function: Load all messages in conversation
const loadMessages = async () => {
  if (!conversationId.value) return;

  try {
    const result = await messageService.getConversationMessages(
      conversationId.value,
      props.currentUserId
    );

    if (result.success) {
      messages.value = result.messages;

      // Scroll to bottom after messages load
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};

// Function: Send text message
const sendMessage = async () => {
  // Validate message content
  if (!canSendMessage.value) return;

  const messageText = newMessage.value.trim();
  const mediaFile = selectedMedia.value;
  const mediaType = selectedMediaType.value;

  // Clear input immediately for better UX
  newMessage.value = '';
  const tempMedia = mediaFile;
  const tempMediaType = mediaType;
  removeSelectedMedia();

  try {
    // Send message with optional media
    const result = await messageService.sendMessageWithMedia(
      conversationId.value,
      props.currentUserId,
      messageText,
      tempMedia,
      tempMediaType
    );

    if (result.success) {
      // Add new message to list
      messages.value.push(result.message);

      // Scroll to bottom to show new message
      await nextTick();
      scrollToBottom();
    } else {
      console.error('Failed to send message:', result.message);
      // Restore message text on failure
      newMessage.value = messageText;
    }
  } catch (error) {
    console.error('Error sending message:', error);
    // Restore message text on error
    newMessage.value = messageText;
  }
};

// Function: Share product link in chat
const shareProductLink = async () => {
  if (!props.productInfo) return;

  const productUrl = `${window.location.origin}/listing/${props.productInfo.listing_id}`;
  const linkMessage = `Check out this item: ${props.productInfo.title}\nPrice: $${props.productInfo.price}\nLink: ${productUrl}`;

  // Set message text and send
  newMessage.value = linkMessage;
  await sendMessage();
};

// Function: Trigger image upload dialog
const triggerImageUpload = () => {
  imageInput.value?.click();
};

// Function: Trigger video upload dialog
const triggerVideoUpload = () => {
  videoInput.value?.click();
};

// Function: Handle file selection for upload
const handleFileSelect = (event, type) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file size (10MB for images, 50MB for videos)
  const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxSize) {
    alert(`File too large. Maximum size: ${type === 'image' ? '10MB' : '50MB'}`);
    return;
  }

  // Store selected file
  selectedMedia.value = file;
  selectedMediaType.value = type;

  // Create preview URL
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedMediaPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // Clear input for future selections
  event.target.value = '';
};

// Function: Remove selected media before sending
const removeSelectedMedia = () => {
  selectedMedia.value = null;
  selectedMediaType.value = null;
  selectedMediaPreview.value = null;
};

// Function: Check seller's online status
const checkSellerOnlineStatus = async () => {
  try {
    const result = await messageService.getOnlineStatus(props.sellerUid);
    if (result.success) {
      isSellerOnline.value = result.is_online;
    }
  } catch (error) {
    console.error('Error checking online status:', error);
  }
};

// Function: Start polling for new messages
const startMessagePolling = () => {
  // Poll every 3 seconds for new messages
  messagePollingInterval = setInterval(() => {
    loadMessages();
    checkSellerOnlineStatus();
  }, 3000);
};

// Function: Stop polling for messages
const stopMessagePolling = () => {
  if (messagePollingInterval) {
    clearInterval(messagePollingInterval);
    messagePollingInterval = null;
  }
};

// Function: Scroll messages container to bottom
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Function: Format message timestamp for display
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  // Show relative time for recent messages
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  // Show time for today's messages
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // Show date for older messages
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Function: Get full media URL from relative path
const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:3000${url}`;
};

// Function: Open media preview in full screen
const openMediaPreview = (media) => {
  // Open media in new tab for full view
  window.open(getMediaUrl(media.url), '_blank');
};

// Function: Close dialog
const closeDialog = () => {
  emit('close');
};

// Function: View product details
const viewProduct = () => {
  if (props.productInfo?.listing_id) {
    emit('product-view', props.productInfo.listing_id);
  }
};

// Lifecycle: Clean up polling on unmount
onUnmounted(() => {
  stopMessagePolling();
});
</script>

<style scoped>
/* Transition animations for dialog appearance */
/* NO fade transition for backdrop since backdrop is removed */

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Custom scrollbar styling for messages container */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Text area auto-resize */
textarea {
  max-height: 100px;
}
</style>

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
                  'max-w-xs px-4 py-2 rounded-lg',
                  message.sender_uid === currentUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                ]"
              >
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
        </div>

        <!-- Media Preview Area: Shows selected image/video before sending -->
        <div
          v-if="selectedMediaPreview"
          class="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center gap-3"
        >
          <div class="relative">
            <!-- Image preview -->
            <img
              v-if="selectedMediaType === 'image'"
              :src="selectedMediaPreview"
              alt="Preview"
              class="w-16 h-16 object-cover rounded"
            />
            <!-- Video preview -->
            <video
              v-else-if="selectedMediaType === 'video'"
              :src="selectedMediaPreview"
              class="w-16 h-16 object-cover rounded"
            ></video>

            <!-- Remove media button -->
            <button
              @click="clearMedia"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-700 truncate">
              {{ selectedMediaType === 'image' ? 'Image ready to send' : 'Video ready to send' }}
            </p>
          </div>
        </div>

        <!-- Message Input Area: Text input with send button and media attachment options -->
        <div class="px-4 py-3 bg-white border-t border-gray-300">
          <div class="flex items-center gap-2">
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
              :disabled="!canSendMessage || sending"
              :class="[
                'p-2 rounded-lg transition duration-200 flex-shrink-0',
                canSendMessage && !sending
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
              title="Send message"
            >
              <svg v-if="!sending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
const sending = ref(false);  // FIXED: Added missing sending state
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

// FIXED: Corrected initializeConversation function
// Function: Initialize conversation when dialog opens
// Creates new conversation or loads existing one
const initializeConversation = async () => {
  // FIXED: Check for correct props instead of non-existent props.listing
  if (!props.sellerUid || !props.currentUserId) {
    console.error('Missing required UIDs', {
      sellerUid: props.sellerUid,
      currentUserId: props.currentUserId
    });
    return;
  }

  try {
    const buyer_uid = props.currentUserId;
    const seller_uid = props.sellerUid;
    const item_id = props.productInfo?.item_id || null;

    // Log for debugging
    console.log('Creating conversation:', { buyer_uid, seller_uid, item_id });

    // Validate UIDs
    if (!buyer_uid || !seller_uid) {
      console.error('Failed to initialize conversation: Buyer UID and Seller UID are required');
      return;
    }

    // Create or get conversation
    const response = await messageService.getOrCreateConversation(
      buyer_uid,
      seller_uid,
      item_id
    );

    if (response.success) {
      conversationId.value = response.conversation_id;
      await loadMessages();
    } else {
      console.error('Failed to initialize conversation:', response.message);
    }
  } catch (error) {
    console.error('Error initializing conversation:', error);
  }
};

// Function: Load all messages in conversation
const loadMessages = async () => {
  if (!conversationId.value) return;

  loading.value = true;
  try {
    const result = await messageService.getConversationMessages(
      conversationId.value,
      props.currentUserId
    );

    if (result.success) {
      messages.value = result.messages || [];

      // Scroll to bottom after messages load
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  } finally {
    loading.value = false;
  }
};

// Function: Send text message
const sendMessage = async () => {
  if (!newMessage.value.trim() && !selectedMedia.value) return;
  if (sending.value) return;

  sending.value = true;

  try {
    // Step 1: Send text message
    const messageData = {
      conversation_id: conversationId.value,
      sender_uid: props.currentUserId,
      message_text: newMessage.value.trim() || ' '
    };

    const response = await messageService.sendMessage(messageData);

    if (response.success) {
      // Step 2: Upload media if selected
      if (selectedMedia.value) {
        const formData = new FormData();
        formData.append('file', selectedMedia.value);
        formData.append('message_id', response.message_id);
        formData.append('media_type', selectedMediaType.value);

        await messageService.uploadMessageMedia(formData);
      }

      // Clear input
      newMessage.value = '';
      clearMedia();

      // Reload messages
      await loadMessages();
    } else {
      console.error('Failed to send message:', response.message);
      alert('Failed to send message. Please try again.');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message. Please try again.');
  } finally {
    sending.value = false;
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
  if (imageInput.value) {
    imageInput.value.click();
  }
};

// Function: Trigger video upload dialog
const triggerVideoUpload = () => {
  if (videoInput.value) {
    videoInput.value.click();
  }
};

// Function: Handle file selection from file input
const handleFileSelect = (event, mediaType) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (mediaType === 'image' && !isImage) {
    alert('Please select an image file');
    return;
  }

  if (mediaType === 'video' && !isVideo) {
    alert('Please select a video file');
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
  selectedMediaType.value = mediaType;

  // Create preview URL
  selectedMediaPreview.value = URL.createObjectURL(file);

  // Clear file input
  event.target.value = '';
};

// Function: Clear selected media
const clearMedia = () => {
  if (selectedMediaPreview.value) {
    URL.revokeObjectURL(selectedMediaPreview.value);
  }
  selectedMedia.value = null;
  selectedMediaType.value = null;
  selectedMediaPreview.value = null;
};

// Function: Get full media URL
const getMediaUrl = (relativePath) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  return `http://localhost:3000${relativePath}`;
};

// Function: Open media in fullscreen (placeholder for future implementation)
const openMediaFullscreen = (url) => {
  window.open(url, '_blank');
};

// Function: Format message timestamp
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Function: Scroll to bottom of message container
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Function: Close message dialog
const closeDialog = () => {
  emit('close');
};

// Function: View product details from dialog
const viewProduct = () => {
  if (props.productInfo && props.productInfo.listing_id) {
    emit('product-view', props.productInfo.listing_id);
  }
};

// Function: Start polling for new messages
const startMessagePolling = () => {
  // Poll every 3 seconds
  messagePollingInterval = setInterval(async () => {
    await loadMessages();
    checkSellerOnlineStatus();
  }, 3000);
};

// Function: Stop polling for new messages
const stopMessagePolling = () => {
  if (messagePollingInterval) {
    clearInterval(messagePollingInterval);
    messagePollingInterval = null;
  }
};

// Function: Check seller online status
// NOTE: getUserOnlineStatus API not implemented yet - temporarily disabled
const checkSellerOnlineStatus = async () => {
  // Online status feature not yet implemented
  // Set to false for now
  isSellerOnline.value = false;
};

// Component lifecycle: Cleanup on unmount
onUnmounted(() => {
  stopMessagePolling();
  clearMedia();
});
</script>

<style scoped>
/* Slide-up transition for dialog appearance */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Custom scrollbar for messages container */
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
</style>

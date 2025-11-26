<template>
  <!-- Order Card Container -->
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
    <div class="p-5">
      <!-- Order Header: ID, Status, and Date -->
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-sm text-gray-500">Order #{{ order.order_id }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ formatDate(order.created_at) }}</p>
        </div>
        <div :class="getStatusBadgeClass(order.order_status)">
          {{ getStatusLabel(order.order_status, viewType) }}
        </div>
      </div>

      <!-- Order Content: Image and Details -->
      <div class="flex gap-4">
        <!-- Product Image -->
        <div class="w-24 h-24 flex-shrink-0">
          <img
            v-if="order.cover_image"
            :src="order.cover_image"
            :alt="order.title"
            class="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
            @click="$emit('view-details', order, viewType)"
          />
          <div
            v-else
            class="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
            @click="$emit('view-details', order, viewType)"
          >
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- Product Details -->
        <div class="flex-1 min-w-0">
          <!-- Title -->
          <h3
            class="font-semibold text-gray-900 text-lg mb-1 truncate cursor-pointer hover:text-blue-600 transition"
            @click="$emit('view-details', order, viewType)"
          >
            {{ order.title }}
          </h3>

          <!-- Category and Condition -->
          <div class="flex items-center gap-2 mb-2">
            <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
              {{ order.category }}
            </span>
            <span class="text-gray-500 text-xs capitalize">{{ order.condition }}</span>
          </div>

          <!-- Delivery Method -->
          <p class="text-sm text-gray-600 mb-2">
            <span class="font-medium">Delivery:</span> {{ formatDeliveryMethod(order.delivery_method) }}
          </p>

          <!-- Contact Person (Seller for buyer view, Buyer for seller view) -->
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>
              {{ viewType === 'buyer' ? 'Seller' : 'Buyer' }}:
              <span class="font-medium text-gray-900">
                {{ viewType === 'buyer' ? order.seller?.name : order.buyer?.name }}
              </span>
            </span>
          </div>
        </div>

        <!-- Price Section -->
        <div class="text-right flex-shrink-0">
          <p class="text-2xl font-bold text-blue-600">${{ order.total }}</p>
          <p class="text-xs text-gray-500">Total (incl. tax)</p>
        </div>
      </div>

      <!-- Review Section: Display existing review or show "Write Review" button -->
      <!-- Only show for COMPLETED orders -->
      <div v-if="order.order_status === 'COMPLETED'" class="mt-4 pt-4 border-t border-gray-200">
        <!-- Existing Review Display -->
        <div v-if="order.has_review && order.review" class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">
                {{ viewType === 'buyer' ? 'Your Review' : 'Buyer Review' }}
              </span>
              <!-- Star Rating Display -->
              <div class="flex items-center">
                <template v-for="star in 5" :key="star">
                  <svg
                    class="w-4 h-4"
                    :class="star <= order.review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </template>
                <span class="ml-1 text-sm text-gray-600">({{ order.review.rating }}/5)</span>
              </div>
            </div>
            <span class="text-xs text-gray-400">{{ formatDate(order.review.review_date) }}</span>
          </div>
          <!-- Review Comment -->
          <p v-if="order.review.comment" class="text-sm text-gray-600 mt-2">
            "{{ order.review.comment }}"
          </p>
          <p v-else class="text-sm text-gray-400 italic mt-2">
            No comment provided
          </p>
          <!-- Reviewer name for seller view -->
          <p v-if="viewType === 'seller' && order.review.reviewer_name" class="text-xs text-gray-500 mt-2">
            - {{ order.review.reviewer_name }}
          </p>
        </div>

        <!-- Write Review Button: Only for buyer view when no review exists -->
        <div v-else-if="viewType === 'buyer' && !order.has_review" class="flex justify-center">
          <button
            @click="$emit('write-review', order)"
            class="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Write Review
          </button>
        </div>

        <!-- Awaiting Review: For seller view when no review exists -->
        <div v-else-if="viewType === 'seller' && !order.has_review" class="text-center">
          <p class="text-sm text-gray-500 italic">Awaiting buyer review</p>
        </div>
      </div>

      <!-- Action Buttons Section -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex gap-2 justify-end flex-wrap">
          <!-- View Details Button (always visible) -->
          <button
            @click="$emit('view-details', order, viewType)"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>

          <!-- Seller Actions for PENDING orders -->
          <template v-if="viewType === 'seller' && order.order_status === 'PENDING'">
            <!-- Complete Order Button -->
            <button
              @click="$emit('complete-order', order)"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Mark Delivered
            </button>

            <!-- Cancel Order Button -->
            <button
              @click="$emit('cancel-order', order, viewType)"
              class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </template>

          <!-- Buyer Actions for PENDING orders -->
          <template v-if="viewType === 'buyer' && order.order_status === 'PENDING'">
            <!-- Cancel Order Button -->
            <button
              @click="$emit('cancel-order', order, viewType)"
              class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Order
            </button>
          </template>

          <!-- Seller actions when buyer requested cancellation -->
          <template v-if="viewType === 'seller' && order.order_status === 'CANCEL_REQUESTED_BY_BUYER'">
            <div class="flex gap-2">
              <button
                @click="$emit('accept-cancel', order)"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Accept Cancellation
              </button>
              <button
                @click="$emit('reject-cancel', order)"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          </template>

          <!-- Buyer actions when seller requested cancellation -->
          <template v-if="viewType === 'buyer' && order.order_status === 'CANCEL_REQUESTED_BY_SELLER'">
            <div class="flex gap-2">
              <button
                @click="$emit('accept-cancel', order)"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Accept Cancellation
              </button>
              <button
                @click="$emit('reject-cancel', order)"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          </template>

          <!-- Waiting indicator for pending cancellation request (requester side) -->
          <template v-if="(viewType === 'buyer' && order.order_status === 'CANCEL_REQUESTED_BY_BUYER') ||
                         (viewType === 'seller' && order.order_status === 'CANCEL_REQUESTED_BY_SELLER')">
            <div class="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
              <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium">Awaiting Response</span>
            </div>
          </template>

          <!-- Status indicator for rejected cancellation -->
          <template v-if="order.order_status === 'CANCEL_REJECTED_BY_BUYER' || order.order_status === 'CANCEL_REJECTED_BY_SELLER'">
            <div class="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span class="text-sm font-medium">Cancellation Rejected</span>
            </div>
          </template>

          <!-- Status indicator for completed orders -->
          <template v-if="order.order_status === 'COMPLETED'">
            <div class="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium">Order Completed</span>
            </div>
          </template>

          <!-- Status indicator for cancelled orders -->
          <template v-if="order.order_status === 'CANCELLED_BY_BUYER' || order.order_status === 'CANCELLED_BY_SELLER'">
            <div class="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="text-sm font-medium">Order Cancelled</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Define component props
const props = defineProps({
  // Order data object containing all order information
  // Now includes: has_review (boolean) and review (object or null)
  order: {
    type: Object,
    required: true
  },
  // View type: 'buyer' for orders bought, 'seller' for orders received
  viewType: {
    type: String,
    required: true,
    validator: (value) => ['buyer', 'seller'].includes(value)
  }
});

// Define component events
// Added 'write-review' event for review functionality
defineEmits([
  'view-details',
  'complete-order',
  'cancel-order',
  'accept-cancel',
  'reject-cancel',
  'write-review'
]);

// Function: Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function: Format delivery method for display
// Truncates "Other methods" if it has additional notes
const formatDeliveryMethod = (method) => {
  if (!method) return 'N/A';
  // If delivery method starts with "Other methods:", truncate it
  if (method.startsWith('Other methods:')) {
    const note = method.substring(14).trim();
    if (note.length > 30) {
      return `Other: ${note.substring(0, 30)}...`;
    }
    return `Other: ${note}`;
  }
  return method;
};

// Function: Get status badge CSS class based on order status
const getStatusBadgeClass = (status) => {
  const baseClass = 'px-3 py-1 rounded-full text-xs font-medium';

  switch (status) {
    case 'PENDING':
      return `${baseClass} bg-yellow-100 text-yellow-800`;
    case 'COMPLETED':
      return `${baseClass} bg-green-100 text-green-800`;
    case 'CANCEL_REQUESTED_BY_BUYER':
    case 'CANCEL_REQUESTED_BY_SELLER':
      return `${baseClass} bg-orange-100 text-orange-800`;
    case 'CANCEL_REJECTED_BY_BUYER':
    case 'CANCEL_REJECTED_BY_SELLER':
      return `${baseClass} bg-red-100 text-red-800`;
    case 'CANCELLED_BY_BUYER':
    case 'CANCELLED_BY_SELLER':
      return `${baseClass} bg-gray-100 text-gray-800`;
    default:
      return `${baseClass} bg-gray-100 text-gray-600`;
  }
};

// Function: Get human-readable status label based on order status and view type
const getStatusLabel = (status, viewType) => {
  if (viewType === 'buyer') {
    // Buyer view labels
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CANCEL_REQUESTED_BY_BUYER':
        return 'Cancellation Requested';
      case 'CANCEL_REQUESTED_BY_SELLER':
        return 'Seller Requested Cancellation';
      case 'CANCEL_REJECTED_BY_SELLER':
        return 'Cancellation Rejected';
      case 'CANCEL_REJECTED_BY_BUYER':
        return 'Rejected Seller Cancellation';
      case 'CANCELLED_BY_BUYER':
        return 'Cancelled';
      case 'CANCELLED_BY_SELLER':
        return 'Cancelled by Seller';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  } else {
    // Seller view labels
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CANCEL_REQUESTED_BY_BUYER':
        return 'Buyer Requested Cancellation';
      case 'CANCEL_REQUESTED_BY_SELLER':
        return 'Cancellation Requested';
      case 'CANCEL_REJECTED_BY_BUYER':
        return 'Cancellation Rejected';
      case 'CANCEL_REJECTED_BY_SELLER':
        return 'Rejected Buyer Cancellation';
      case 'CANCELLED_BY_BUYER':
        return 'Cancelled by Buyer';
      case 'CANCELLED_BY_SELLER':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  }
};
</script>

<style scoped>
/* Smooth transitions for interactive elements */
.transition {
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

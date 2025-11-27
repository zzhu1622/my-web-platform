<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header Section -->
    <header class="bg-white shadow-md sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left Side: Back Button and Logo -->
          <div class="flex items-center gap-4">
            <!-- Return to Product Button -->
            <!-- This button navigates back to the product detail page -->
            <button
              @click="returnToProduct"
              class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span class="font-medium">Back to Product</span>
            </button>

            <!-- Logo and App Name -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">AE</span>
              </div>
              <span class="text-xl font-bold text-gray-900">AptExchange</span>
            </div>
          </div>

          <!-- Right Side: User Menu -->
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition duration-200"
            >
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold text-sm">
                  {{ currentUser?.name?.charAt(0)?.toUpperCase() || 'U' }}
                </span>
              </div>
              <span class="font-medium hidden sm:block">{{ currentUser?.name || 'User' }}</span>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="[showUserMenu ? 'rotate-180' : '']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <!-- My Account Option -->
              <button
                @click="handleMenuClick('account')"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 transition duration-150 text-gray-900"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Account
              </button>

              <!-- My Messages Option -->
              <button
                @click="handleMenuClick('messages')"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 transition duration-150 text-gray-900 border-t border-gray-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                My Messages
              </button>

              <!-- My Orders Option -->
              <button
                @click="handleMenuClick('orders')"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 transition duration-150 text-gray-900 border-t border-gray-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                My Orders
              </button>

              <!-- Post Listing Option -->
              <button
                @click="handleMenuClick('postlisting')"
                class="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 transition duration-150 text-gray-900 border-t border-gray-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Post Listing
              </button>

              <!-- Logout Option -->
              <button
                @click="handleMenuClick('logout')"
                class="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 transition duration-150 text-red-600 border-t border-gray-200 font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Section -->
    <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <!-- Page Header with Seller Context -->
      <div class="mb-8">
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <!-- Breadcrumb navigation -->
          <button @click="returnToProduct" class="hover:text-blue-600 transition duration-200">
            Product
          </button>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-gray-700">Seller Profile</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Seller Profile</h1>
        <p class="text-gray-600 mt-2">View seller information, ratings, and reviews</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-8">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading seller profile...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-md p-8">
        <div class="text-center">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-red-600 font-medium mb-4">{{ error }}</p>
          <button
            @click="returnToProduct"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Product
          </button>
        </div>
      </div>

      <!-- Seller Profile Content (Overview Only) -->
      <div v-else class="space-y-6">
        <!-- User Profile Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Public Profile</h2>
          <div class="flex flex-col sm:flex-row items-start gap-6">
            <!-- Avatar -->
            <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-blue-600 font-bold text-3xl">
                {{ sellerData.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
              </span>
            </div>

            <!-- User Info -->
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-900">{{ sellerData.user?.name || 'Unknown' }}</h3>
              <div class="mt-2 space-y-1">
                <!-- Email -->
                <p class="text-gray-600 flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ sellerData.user?.email || 'No email' }}
                </p>
                <!-- Phone -->
                <p class="text-gray-600 flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ sellerData.user?.phone || 'No phone' }}
                </p>
              </div>
            </div>

            <!-- Stats Summary -->
            <div class="flex gap-6 mt-4 sm:mt-0">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{{ sellerData.stats?.active_listings || 0 }}</div>
                <div class="text-sm text-gray-500">Active Listings</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">{{ sellerData.stats?.items_sold || 0 }}</div>
                <div class="text-sm text-gray-500">Items Sold</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seller Rating Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Seller Rating</h2>
          <div class="flex items-center gap-6">
            <!-- Rating Display -->
            <div class="flex items-center gap-2">
              <div class="text-5xl font-bold text-yellow-500">
                {{ formatRating(sellerData.stats?.total_score) }}
              </div>
              <div class="flex flex-col">
                <!-- Star Icons -->
                <div class="flex items-center">
                  <template v-for="star in 5" :key="star">
                    <svg
                      class="w-5 h-5"
                      :class="star <= Math.round(sellerData.stats?.total_score || 0) ? 'text-yellow-400' : 'text-gray-300'"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </template>
                </div>
                <span class="text-sm text-gray-500">{{ sellerData.stats?.review_count || 0 }} reviews</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Received Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Reviews Received</h2>

          <!-- No Reviews Message -->
          <div v-if="!sellerData.reviews || sellerData.reviews.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p class="text-gray-500">No reviews yet</p>
            <p class="text-gray-400 text-sm mt-1">This seller has not received any reviews from buyers</p>
          </div>

          <!-- Reviews List -->
          <div v-else class="space-y-4">
            <div
              v-for="review in sellerData.reviews"
              :key="review.review_id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <!-- Star Rating -->
                  <div class="flex items-center gap-1">
                    <template v-for="star in 5" :key="star">
                      <svg
                        class="w-4 h-4"
                        :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </template>
                  </div>
                  <!-- Item Title -->
                  <p class="text-sm text-gray-500 mt-1">For: {{ review.item_title }}</p>
                </div>
                <!-- Review Date -->
                <span class="text-sm text-gray-400">{{ formatDate(review.review_date) }}</span>
              </div>
              <!-- Review Comment -->
              <p v-if="review.comment" class="text-gray-700 mt-2">{{ review.comment }}</p>
              <p v-else class="text-gray-400 italic mt-2">No comment provided</p>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Footer Section -->
    <footer class="bg-gray-900 text-gray-300 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-400">2025 AptExchange. All rights reserved. CSC 4710 Database Systems Project.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authService from '../services/authService';
import accountService from '../services/accountService';

// Vue Router instances for navigation
const router = useRouter();
const route = useRoute();

// Current logged-in user data from localStorage
const currentUser = ref(null);

// UI state variables
const showUserMenu = ref(false);
const loading = ref(true);
const error = ref(null);

// Seller profile data retrieved from API
// This stores the overview data for the seller being viewed
const sellerData = ref({
  user: null,
  reviews: [],
  stats: null
});

// Return path stored from query parameter
// Used to navigate back to the original product detail page
const returnPath = ref('/home');

// Lifecycle hook: runs when component is mounted to DOM
// Loads current user data and fetches seller profile information
onMounted(async () => {
  // Check if current user is logged in
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    // Not logged in, redirect to login page
    router.push('/');
    return;
  }

  try {
    currentUser.value = JSON.parse(storedUser);
  } catch (err) {
    console.error('Error parsing user data:', err);
    router.push('/');
    return;
  }

  // Extract seller ID and return path from query parameters
  const sellerId = route.query.sellerId;
  const returnTo = route.query.returnTo;

  // Store return path for navigation
  if (returnTo) {
    returnPath.value = returnTo;
  }

  // Validate seller ID is provided
  if (!sellerId) {
    error.value = 'No seller ID provided';
    loading.value = false;
    return;
  }

  // Fetch seller profile data from backend API
  await loadSellerProfile(sellerId);
});

// Function: Load seller profile data from API
// Parameters: sellerId - The user ID of the seller to display
// Uses the existing getUserOverview endpoint which returns public profile data
const loadSellerProfile = async (sellerId) => {
  loading.value = true;
  error.value = null;

  try {
    // Call the account service to get user overview data
    // This endpoint returns: user info, reviews received, and statistics
    const response = await accountService.getUserOverview(sellerId);

    if (response.success) {
      // Store the seller data for display
      sellerData.value = {
        user: response.user,
        reviews: response.reviews,
        stats: response.stats
      };
    } else {
      // API returned an error
      error.value = response.message || 'Failed to load seller profile';
    }
  } catch (err) {
    // Unexpected error occurred during API call
    console.error('Error loading seller profile:', err);
    error.value = 'An unexpected error occurred while loading the seller profile';
  } finally {
    loading.value = false;
  }
};

// Function: Navigate back to the original product detail page
// Uses the returnPath stored from query parameters
const returnToProduct = () => {
  router.push(returnPath.value);
};

// Function: Handle user menu click events
// Processes dropdown menu selections and navigates accordingly
const handleMenuClick = (action) => {
  showUserMenu.value = false;

  switch (action) {
    case 'account':
      router.push('/account');
      break;
    case 'messages':
      router.push('/messages');
      break;
    case 'orders':
      router.push('/orders');
      break;
    case 'postlisting':
      router.push('/post-listing');
      break;
    case 'logout':
      handleLogout();
      break;
    default:
      break;
  }
};

// Function: Handle user logout
// Clears authentication data and redirects to login page
const handleLogout = () => {
  authService.logout();
  router.push('/');
};

// Function: Format date for display
// Converts ISO date string to human-readable format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Function: Format rating score for display
// Ensures consistent decimal formatting for ratings
const formatRating = (score) => {
  if (!score && score !== 0) return '0.0';
  return parseFloat(score).toFixed(1);
};
</script>

<style scoped>
/* Line clamp utility for text truncation */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>

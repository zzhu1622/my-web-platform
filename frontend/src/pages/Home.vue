<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section: Contains logo, title, and user profile dropdown -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

        <!-- Left Section: Logo and Platform Title -->
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-blue-600">AptExchange</h1>
          <p class="text-sm text-gray-600 mt-1">Marketplace for residents living</p>
        </div>

        <!-- Right Section: User Profile Dropdown Menu -->
        <div class="relative">
          <!-- User Profile Button -->
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <!-- User Icon SVG -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <!-- Display logged-in user name -->
            <span class="font-medium text-gray-900">{{ user?.name || 'User' }}</span>
            <!-- Chevron Icon that rotates when menu is open -->
            <svg
              :class="['w-5 h-5 transition duration-200', showUserMenu ? 'rotate-180' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          <!-- Dropdown Menu: Appears when user clicks profile button -->
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
    </header>

    <!-- Main Content Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <!-- Section Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Featured Listings</h2>
        <p class="text-gray-600 mt-2">Browse second-hand items from your neighbors</p>
      </div>

      <!-- Loading State: Shows while fetching data from database -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="text-gray-500 text-lg">Loading listings...</div>
      </div>

      <!-- Empty State: Shows when no listings exist in database -->
      <div v-else-if="listings.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No listings available at the moment</p>
      </div>

      <!-- Product Listings Grid: Displays all available products -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <!-- Individual Product Card -->
        <div
          v-for="listing in listings"
          :key="listing.ListID"
          class="bg-white rounded-lg shadow hover:shadow-lg transition duration-200 cursor-pointer overflow-hidden group"
        >

          <!-- Product Image Container -->
          <div class="group relative overflow-hidden bg-gray-200 h-64">
            <!-- Product Image -->
            <img
              :src="listing.images?.[0] || '/placeholder.png'"
              :alt="listing.title || 'Product image'"
              class="relative z-10 w-full h-full object-cover transition duration-300 group-hover:scale-105"
              @click="viewListing(listing.ListID)"
            />

            <!-- Days Remaining Badge -->
            <div
              class="absolute z-20 top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold"
            >
              Only {{ daysRemaining(listing.expire_date) }} days left
            </div>

            <!-- Hover Overlay (behind the image, non-interactive) -->
            <div
              class="absolute z-0 inset-0 pointer-events-none bg-black/0 group-hover:bg-black/20 transition duration-200"
            ></div>
          </div>


          <!-- Product Information Section -->
          <div class="p-4">

            <!-- Product Title: Clickable to view details (reserved for later) -->
            <h3
              class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition duration-200 cursor-pointer"
              @click="viewListing(listing.ListID)"
            >
              {{ listing.title }}
            </h3>

            <!-- Product Price: Clickable to view details (reserved for later) -->
            <div
              class="text-2xl font-bold text-blue-600 mb-3 hover:text-blue-700 transition duration-200 cursor-pointer"
              @click="viewListing(listing.ListID)"
            >
              ${{ listing.selling_price.toFixed(2) }}
            </div>

            <!-- Seller Information -->
            <div class="text-sm text-gray-600 mb-4">
              <p>Seller: <span class="font-medium text-gray-900">{{ listing.seller_name }}</span></p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <!-- Message Seller Button -->
              <button
                @click="messageSeller(listing.seller_name, listing.ListID)"
                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition duration-200 font-medium text-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>

              <!-- View Details Button -->
              <button
                @click="viewListing(listing.ListID)"
                class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg transition duration-200 font-medium text-sm"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Section -->
    <footer class="bg-gray-900 text-gray-300 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <!-- Footer Column 1: About -->
          <div>
            <h3 class="text-white font-bold mb-4">AptExchange</h3>
            <p class="text-sm">Marketplace for residents living. Buy and sell second-hand items in your apartment community.</p>
          </div>

          <!-- Footer Column 2: Quick Links -->
          <div>
            <h4 class="text-white font-bold mb-4">Quick Links</h4>
            <ul class="text-sm space-y-2">
              <li><a href="#" class="hover:text-white transition duration-200">Browse Listings</a></li>
              <li><a href="#" class="hover:text-white transition duration-200">My Account</a></li>
              <li><a href="#" class="hover:text-white transition duration-200">Messages</a></li>
            </ul>
          </div>

          <!-- Footer Column 3: Support -->
          <div>
            <h4 class="text-white font-bold mb-4">Support</h4>
            <ul class="text-sm space-y-2">
              <li><a href="#" class="hover:text-white transition duration-200">Help Center</a></li>
              <li><a href="#" class="hover:text-white transition duration-200">Contact Us</a></li>
              <li><a href="#" class="hover:text-white transition duration-200">Report Issue</a></li>
            </ul>
          </div>

          <!-- Footer Column 4: Legal -->
          <div>
            <h4 class="text-white font-bold mb-4">Legal</h4>
            <ul class="text-sm space-y-2">
              <li><a href="#" class="hover:text-white transition duration-200">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white transition duration-200">Terms of Service</a></li>
              <li><a href="#" class="hover:text-white transition duration-200">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom: Copyright -->
        <div class="border-t border-gray-700 pt-8 text-sm text-center">
          <p>&copy; 2025 AptExchange. All rights reserved. CSC 4710 Database Systems Project.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import listingService from '../services/listingService';

// Vue Router instance for navigation
const router = useRouter();

// State variables for component data management
const user = ref(null);
const showUserMenu = ref(false);
const listings = ref([]);
const loading = ref(true);

// Function: Calculate remaining days until listing expires
const daysRemaining = (expireDate) => {
  const today = new Date();
  const expire = new Date(expireDate);
  const timeDifference = expire - today;
  const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return Math.max(0, daysRemaining);
};

// Function: Handle user menu click events
const handleMenuClick = (action) => {
  // Close dropdown menu
  showUserMenu.value = false;

  // Process menu action based on selection
  switch (action) {
    case 'account':
      // Route to account dashboard (reserved for later implementation)
      console.log('Navigating to My Account');
      // router.push('/account');
      break;

    case 'messages':
      // Route to messages page (reserved for later implementation)
      console.log('Navigating to My Messages');
      // router.push('/messages');
      break;

    case 'orders':
      // Route to orders page (reserved for later implementation)
      console.log('Navigating to My Orders');
      // router.push('/orders');
      break;

    case 'logout':
      // Perform logout and return to login page
      handleLogout();
      break;

    default:
      break;
  }
};

// Function: Handle logout and redirect to login page
const handleLogout = () => {
  // Clear user data from local storage
  authService.logout();

  // Redirect to login page
  router.push('/');
};

// Function: Navigate to product details page (reserved for later)
const viewListing = (listingId) => {
  // This functionality is reserved for later implementation
  console.log('View listing details for ListID:', listingId);
  // router.push(`/listing/${listingId}`);
};

// Function: Navigate to messaging page (reserved for later)
const messageSeller = (sellerName, listingId) => {
  // This functionality is reserved for later implementation
  console.log('Message seller:', sellerName, 'for listing:', listingId);
  // router.push(`/message/${listingId}`);
};

// Lifecycle Hook: Runs when component is mounted to DOM
onMounted(async () => {
  // Retrieve user data from browser's local storage
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    // Parse stored JSON and load user data into component state
    user.value = JSON.parse(storedUser);
  } else {
    // User is not logged in, redirect to login page
    router.push('/');
    return;
  }

  // Fetch all product listings from backend API
  const response = await listingService.getAllListings();

  if (response.success) {
    // Store listings in component state for display
    listings.value = response.data;
  } else {
    // Log error and show empty listings
    console.error('Failed to fetch listings:', response.message);
    listings.value = [];
  }

  // Stop loading animation once data is fetched
  loading.value = false;
});
</script>

<style scoped>
/* Global styles for this component */

/* Container: Full height minimum with light gray background */
.min-h-screen {
  background-color: #f9fafb;
}

/* Smooth transitions for all interactive elements */
.transition {
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Text truncation: Show ellipsis after 2 lines */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section: Logo and navigation -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

        <!-- Left Section: AptExchange branding with back button -->
        <div class="flex items-center gap-4">
          <!-- Back to Home button -->
          <button
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Platform title -->
          <h1 class="text-3xl font-bold text-blue-600">AptExchange</h1>
        </div>

        <!-- Right Section: User profile dropdown -->
        <div class="relative">
          <!-- User profile button -->
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <!-- User icon SVG -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <!-- Display logged-in user name -->
            <span class="font-medium text-gray-900">{{ user?.name || 'User' }}</span>
            <!-- Dropdown chevron icon -->
            <svg
              :class="['w-5 h-5 transition duration-200', showUserMenu ? 'rotate-180' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          <!-- Dropdown menu: appears when user clicks profile button -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <!-- Menu options -->
            <button
              @click="handleMenuClick('account')"
              class="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 transition duration-150 text-gray-900"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Account
            </button>

            <button
              @click="handleMenuClick('messages')"
              class="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 transition duration-150 text-gray-900 border-t border-gray-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              My Messages
            </button>

            <button
              @click="handleMenuClick('orders')"
              class="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 transition duration-150 text-gray-900 border-t border-gray-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              My Orders
            </button>

            <button
              @click="handleMenuClick('postlisting')"
              class="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 transition duration-150 text-gray-900 border-t border-gray-200"
            >
              <!-- Plus Icon SVG for creating a new listing -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Post Listing
            </button>

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

    <!-- Loading state: shows while fetching listing details from database -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="text-gray-500 text-lg">Loading product details...</div>
    </div>

    <!-- Error state: shows if listing fetch fails -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-700 font-medium mb-4">{{ error }}</p>
        <button
          @click="goBack"
          class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-200"
        >
          Go Back to Listings
        </button>
      </div>
    </div>

    <!-- Main content: product details with media gallery -->
    <main v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <!-- Breadcrumb navigation -->
      <div class="mb-8 text-sm">
        <button @click="goBack" class="text-blue-600 hover:text-blue-700 font-medium">
          Back to Listings
        </button>
        <span class="text-gray-400 mx-2">/</span>
        <span class="text-gray-600">{{ listing.title }}</span>
      </div>

      <!-- Main product display section: media gallery on left, info on right -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left Column: Media Gallery (Images and Videos) -->
        <div class="lg:col-span-2">

          <!-- Main image display area -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">

            <!-- Main image display with zoom on hover -->
            <div class="relative bg-gray-100 w-full h-96 flex items-center justify-center overflow-hidden group">
              <img
                v-if="currentMedia.type === 'image'"
                :src="currentMedia.url"
                :alt="currentMedia.alt_text || 'Product image'"
                class="w-full h-full object-cover transition duration-300 group-hover:scale-105 cursor-zoom-in"
              />

              <!-- Video player for video media -->
              <video
                v-else-if="currentMedia.type === 'video'"
                controls
                class="w-full h-full object-cover"
                controlsList="nodownload"
              >
                <source :src="getVideoUrl(currentMedia.url)" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <!-- Fallback for no media -->
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
                <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <!-- Media counter badge: shows current media position -->
              <div class="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                {{ currentMediaIndex + 1 }} / {{ listing.media.total_count }}
              </div>

              <!-- Navigation arrows for media gallery -->
              <button
                v-if="listing.media.total_count > 1"
                @click="previousMedia"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition duration-200 shadow-md"
              >
                <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                v-if="listing.media.total_count > 1"
                @click="nextMedia"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition duration-200 shadow-md"
              >
                <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Thumbnail gallery for media selection -->
            <div v-if="listing.media.total_count > 1" class="p-4 bg-white">
              <p class="text-sm text-gray-600 mb-3 font-medium">Photos and Videos</p>
              <div class="grid grid-cols-4 gap-3 sm:grid-cols-6">
                <!-- Thumbnail for each media item -->
                <button
                  v-for="(media, index) in allMediaItems"
                  :key="`media-${index}`"
                  @click="selectMedia(index)"
                  :class="[
                    'relative rounded-lg overflow-hidden border-2 transition duration-200',
                    currentMediaIndex === index ? 'border-blue-600 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                  ]"
                >
                  <!-- Image thumbnail -->
                  <img
                    v-if="media.type === 'image'"
                    :src="media.url"
                    :alt="media.alt_text || 'Thumbnail'"
                    class="w-full h-16 object-cover"
                  />

                  <!-- Video thumbnail with play icon -->
                  <div v-else-if="media.type === 'video'" class="w-full h-16 bg-gray-200 flex items-center justify-center relative">
                    <img
                      v-if="media.thumbnail"
                      :src="media.thumbnail"
                      :alt="'Video thumbnail'"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full bg-gray-300 flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <!-- Play icon overlay for video thumbnails -->
                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition duration-200">
                      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Product Description Section -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Description</h2>

            <!-- Item description from seller -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">About this item</h3>
              <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {{ listing.descriptions.item_description || 'No description provided' }}
              </p>
            </div>

            <!-- Listing-specific condition description -->
            <div v-if="listing.descriptions.listing_description" class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Condition Details</h3>
              <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {{ listing.descriptions.listing_description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Product Information, Pricing, and Action Buttons -->
        <div class="lg:col-span-1">

          <!-- Product Title and Pricing Card -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-8">

            <!-- Product Title -->
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ listing.title }}</h1>

            <!-- Category Badge -->
            <div class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              {{ listing.category }}
            </div>

            <!-- Pricing Information -->
            <div class="border-t border-gray-200 pt-4 mt-4">
              <!-- Selling Price: Highlighted as main price -->
              <div class="mb-3">
                <p class="text-gray-600 text-sm mb-1">Asking Price</p>
                <p class="text-4xl font-bold text-blue-600">
                  ${{ listing.selling_price.toFixed(2) }}
                </p>
              </div>

              <!-- Original Price (if available) for comparison -->
              <div v-if="listing.original_price" class="mb-3">
                <p class="text-gray-600 text-sm mb-1">Original Price</p>
                <p class="text-lg text-gray-500 line-through">
                  ${{ listing.original_price.toFixed(2) }}
                </p>
                <!-- Calculate and show savings percentage -->
                <p class="text-sm text-green-600 font-medium">
                  Save {{ calculateSavingsPercentage }}%
                </p>
              </div>
            </div>

            <!-- Product Condition Information -->
            <div class="border-t border-gray-200 pt-4 mt-4">
              <div class="grid grid-cols-2 gap-4">
                <!-- Condition status -->
                <div>
                  <p class="text-gray-600 text-sm mb-1">Condition</p>
                  <p class="font-semibold text-gray-900 capitalize">{{ listing.condition }}</p>
                </div>

                <!-- Days remaining for purchase -->
                <div>
                  <p class="text-gray-600 text-sm mb-1">Available for</p>
                  <p :class="['font-semibold', daysLeft <= 3 ? 'text-red-600' : 'text-gray-900']">
                    {{ daysLeft }} days
                  </p>
                </div>
              </div>
            </div>

            <!-- Seller Information Card -->
            <div class="bg-gray-50 rounded-lg p-4 mt-6">
              <p class="text-gray-600 text-sm mb-3 font-medium">Seller Information</p>

              <!-- Seller name -->
              <p class="font-semibold text-gray-900 text-lg mb-1">{{ listing.seller.name }}</p>

              <!-- Seller email with icon -->
              <div class="flex items-center gap-2 text-gray-700 mb-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-sm">{{ listing.seller.email }}</span>
              </div>

              <!-- Seller phone (if available) with icon -->
              <div v-if="listing.seller.phone" class="flex items-center gap-2 text-gray-700">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="text-sm">{{ listing.seller.phone }}</span>
              </div>
            </div>

            <!-- Action Buttons: Message and Purchase -->
            <div class="flex gap-3 mt-6">
              <!-- Message Seller Button: Opens messaging interface -->
              <button
                @click="messageSeller"
                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition duration-200 font-semibold text-base"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>

              <!-- Purchase Button: Initiates purchase order process -->
              <button
                @click="purchaseItem"
                class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition duration-200 font-semibold text-base"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m0 0h2.71a1 1 0 001-.929l-.604-3.431a1 1 0 00-.985-.929H6.604" />
                </svg>
                I Want to Buy
              </button>
            </div>

            <!-- Status Badge: Shows current listing status -->
            <div v-if="listing.status !== 'active'" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-yellow-800 text-sm">
                <span class="font-semibold">Status:</span> {{ listing.status }}
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Footer Section -->
    <footer class="bg-gray-900 text-gray-300 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <!-- Footer content grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          <!-- Footer Column 1: About -->
          <div>
            <h4 class="text-white font-bold mb-4">About AptExchange</h4>
            <p class="text-sm leading-relaxed">A community marketplace for apartment residents to buy and sell second-hand items efficiently and safely.</p>
          </div>

          <!-- Footer Column 2: Quick Links -->
          <div>
            <h4 class="text-white font-bold mb-4">Quick Links</h4>
            <ul class="text-sm space-y-2">
              <li><button @click="goBack" class="hover:text-white transition duration-200">Browse Listings</button></li>
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

        <!-- Footer bottom: Copyright -->
        <div class="border-t border-gray-700 pt-8 text-sm text-center">
          <p>&copy; 2025 AptExchange. All rights reserved. CSC 4710 Database Systems Project.</p>
        </div>
      </div>
    </footer>

    <!-- Message Dialog Component: Floating chat window (ADDED) -->
    <MessageDialog
      :is-open="messageDialogOpen"
      :seller-uid="listing?.seller?.uid || 0"
      :seller-name="listing?.seller?.name || ''"
      :current-user-id="user?.UID || 0"
      :product-info="productInfoForDialog"
      @close="closeMessageDialog"
      @product-view="viewListingFromDialog"
    />

    <!-- Order Confirmation Dialog: Purchase flow with delivery method selection (NEW) -->
    <div
      v-if="orderDialogOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeOrderDialog"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">

        <!-- Dialog Header -->
        <div class="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">Confirm Your Purchase</h2>
            <button
              @click="closeOrderDialog"
              class="text-white hover:text-gray-200 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Success State: Order Created Successfully -->
        <div v-if="orderSuccess" class="p-8 text-center">
          <div class="mb-6">
            <svg class="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully</h3>
          <p class="text-gray-600 mb-4">
            Your order has been confirmed and the item is now reserved for you.
          </p>
          <p class="text-sm text-gray-500 mb-6">
            Order ID: <span class="font-mono font-medium">{{ createdOrderId }}</span>
          </p>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <p class="text-green-800 text-sm font-medium mb-2">Next Steps:</p>
            <ul class="text-green-700 text-sm space-y-1 list-disc list-inside">
              <li>Contact the seller to arrange the delivery</li>
              <li>Check your orders page for details</li>
              <li>Complete the transaction as agreed</li>
            </ul>
          </div>
        </div>

        <!-- Order Form: Delivery Method Selection -->
        <div v-else class="p-6">

          <!-- Order Summary Section -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex gap-4">
                <!-- Product Image -->
                <div class="w-20 h-20 flex-shrink-0">
                  <img
                    v-if="allMediaItems[0]?.type === 'image'"
                    :src="allMediaItems[0]?.url"
                    :alt="listing?.title"
                    class="w-full h-full object-cover rounded"
                  />
                  <div v-else class="w-full h-full bg-gray-300 rounded flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <!-- Product Details -->
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 mb-1">{{ listing?.title }}</h4>
                  <p class="text-sm text-gray-600 mb-2">Seller: {{ listing?.seller?.name }}</p>
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-bold text-blue-600">${{ listing?.selling_price?.toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="mt-4 pt-4 border-t border-gray-300">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Item Price:</span>
                    <span class="font-medium text-gray-900">${{ listing?.selling_price?.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tax (8%):</span>
                    <span class="font-medium text-gray-900">${{ (listing?.selling_price * 0.08).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Platform Fee (5%):</span>
                    <span class="font-medium text-gray-900">${{ (listing?.selling_price * 0.05).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between pt-2 border-t border-gray-300">
                    <span class="font-semibold text-gray-900">Total:</span>
                    <span class="font-bold text-blue-600 text-lg">
                      ${{ (listing?.selling_price * 1.13).toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery Method Selection -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Select Delivery Method</h3>

            <div class="space-y-3">
              <!-- Option 1: Pick up at seller door -->
              <label
                :class="[
                  'block p-4 border-2 rounded-lg cursor-pointer transition',
                  selectedDeliveryMethod === 'Pick up at the seller door'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="flex items-start gap-3">
                  <input
                    type="radio"
                    v-model="selectedDeliveryMethod"
                    value="Pick up at the seller door"
                    class="mt-1"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">Pick up at the seller door</div>
                    <div class="text-sm text-gray-600 mt-1">
                      Arrange a time to pick up the item directly from the seller
                    </div>
                  </div>
                </div>
              </label>

              <!-- Option 2: Delivered to your door -->
              <label
                :class="[
                  'block p-4 border-2 rounded-lg cursor-pointer transition',
                  selectedDeliveryMethod === 'Delivered to your door'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="flex items-start gap-3">
                  <input
                    type="radio"
                    v-model="selectedDeliveryMethod"
                    value="Delivered to your door"
                    class="mt-1"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">Delivered to your door</div>
                    <div class="text-sm text-gray-600 mt-1">
                      Seller will deliver the item to your location
                    </div>
                  </div>
                </div>
              </label>

              <!-- Option 3: Other methods with custom note -->
              <label
                :class="[
                  'block p-4 border-2 rounded-lg cursor-pointer transition',
                  selectedDeliveryMethod === 'Other methods'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="flex items-start gap-3">
                  <input
                    type="radio"
                    v-model="selectedDeliveryMethod"
                    value="Other methods"
                    class="mt-1"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">Other methods</div>
                    <div class="text-sm text-gray-600 mt-1">
                      Specify your preferred delivery arrangement
                    </div>
                  </div>
                </div>

                <!-- Delivery Note Input: Only shown when "Other methods" is selected -->
                <div v-if="selectedDeliveryMethod === 'Other methods'" class="mt-3 ml-6">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions
                  </label>
                  <textarea
                    v-model="deliveryNote"
                    rows="3"
                    maxlength="500"
                    placeholder="e.g., Meet at building lobby at 3 PM"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                  <div class="text-xs text-gray-500 mt-1 text-right">
                    {{ deliveryNote.length }} / 500 characters
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Error Message Display -->
          <div v-if="orderError" class="mb-6">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex gap-2">
                <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-red-700">{{ orderError }}</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="closeOrderDialog"
              :disabled="orderSubmitting"
              class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              @click="submitOrder"
              :disabled="orderSubmitting || !selectedDeliveryMethod"
              class="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="orderSubmitting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ orderSubmitting ? 'Submitting...' : 'Confirm Purchase' }}
            </button>
          </div>

          <!-- Additional Information -->
          <div class="mt-6 bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-600 leading-relaxed">
              By confirming this purchase, you agree to complete the transaction according to the delivery method selected.
              The seller will be notified of your order and will contact you to finalize the delivery arrangements.
              Once the order is placed, the item will be reserved and removed from available listings.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authService from '../services/authService';
import listingService from '../services/listingService';
import orderService from '../services/orderService';
import MessageDialog from '../components/MessageDialog.vue';

// Router and route instances for navigation
const router = useRouter();
const route = useRoute();

// Component state variables for managing listing data and UI
const user = ref(null);
const showUserMenu = ref(false);
const listing = ref(null);
const loading = ref(true);
const error = ref(null);

// Media gallery state variables
const currentMediaIndex = ref(0);
const allMediaItems = ref([]);

// Message dialog state (ADDED)
const messageDialogOpen = ref(false);

// Order confirmation dialog state (NEW)
const orderDialogOpen = ref(false);
const selectedDeliveryMethod = ref('');
const deliveryNote = ref('');
const orderSubmitting = ref(false);
const orderSuccess = ref(false);
const orderError = ref(null);
const createdOrderId = ref(null);

// Lifecycle hook: runs when component is mounted to DOM
// Initializes component by loading user data and fetching listing details
onMounted(async () => {
  // Retrieve user data from browser local storage
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    user.value = JSON.parse(storedUser);
  } else {
    // User is not logged in, redirect to login page
    router.push('/');
    return;
  }

  // Extract listing ID from URL parameters
  const listingId = route.params.listingId;

  if (!listingId) {
    error.value = 'No listing ID provided';
    loading.value = false;
    return;
  }

  // Fetch listing details from backend API
  const response = await listingService.getListingById(listingId);

  if (response.success && response.data) {
    listing.value = response.data;

    // Combine all media items (images and videos) in creation order
    const allMedia = [
      ...listing.value.media.images,
      ...listing.value.media.videos
    ];

    allMediaItems.value = allMedia;

    // Reset to first media item
    currentMediaIndex.value = 0;
  } else {
    error.value = response.message || 'Failed to load listing details';
  }

  loading.value = false;
});

// Computed property: returns current media item being displayed
const currentMedia = computed(() => {
  if (allMediaItems.value.length === 0) {
    return { type: 'image', url: '/placeholder.png', alt_text: 'No image' };
  }
  return allMediaItems.value[currentMediaIndex.value] || { type: 'image', url: '/placeholder.png' };
});

// Computed property: calculates number of days remaining until listing expires
const daysLeft = computed(() => {
  if (!listing.value || !listing.value.expire_date) return 0;

  const today = new Date();
  const expireDate = new Date(listing.value.expire_date);
  const timeDifference = expireDate - today;
  const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return Math.max(0, daysRemaining);
});

// Computed property: calculates savings percentage if original price is available
const calculateSavingsPercentage = computed(() => {
  if (!listing.value || !listing.value.original_price) return 0;

  const savings = listing.value.original_price - listing.value.selling_price;
  const percentage = (savings / listing.value.original_price) * 100;

  return Math.round(percentage);
});

// Computed property: prepare product info for message dialog (ADDED)
const productInfoForDialog = computed(() => {
  if (!listing.value) return null;

  return {
    listing_id: listing.value.ListID,
    item_id: listing.value.ItemID,
    title: listing.value.title,
    price: listing.value.selling_price,
    image: allMediaItems.value[0]?.url || null
  };
});

// Function: navigate to previous media item in gallery
const previousMedia = () => {
  currentMediaIndex.value = (currentMediaIndex.value - 1 + allMediaItems.value.length) % allMediaItems.value.length;
};

// Function: navigate to next media item in gallery
const nextMedia = () => {
  currentMediaIndex.value = (currentMediaIndex.value + 1) % allMediaItems.value.length;
};

// Function: select specific media item by index
const selectMedia = (index) => {
  currentMediaIndex.value = index;
};

// Function: go back to home page
const goBack = () => {
  router.push('/home');
};

// Function: handle user menu click events
const handleMenuClick = (action) => {
  showUserMenu.value = false;

  switch (action) {
    case 'account':
      console.log('Navigating to My Account');
      break;

    case 'messages':
      router.push('/messages');
      break;

    case 'orders':
      router.push('/orders');
      break;

    case 'postlisting':
      console.log('Navigating to Post Listing');
      break;

    case 'logout':
      handleLogout();
      break;

    default:
      break;
  }
};

// Function: handle logout and redirect to login page
const handleLogout = () => {
  authService.logout();
  router.push('/');
};

// Function: open message dialog with seller (MODIFIED)
const messageSeller = () => {
  // Prevent user from messaging themselves
  if (listing.value.seller.uid === user.value?.UID) {
    alert('You cannot message yourself!');
    return;
  }

  // Open message dialog
  messageDialogOpen.value = true;
};

// Function: close message dialog (ADDED)
const closeMessageDialog = () => {
  messageDialogOpen.value = false;
};

// Function: view listing from message dialog product link (ADDED)
const viewListingFromDialog = (listingId) => {
  // If same listing, just close dialog
  if (listingId === listing.value?.ListID) {
    closeMessageDialog();
    return;
  }

  // Navigate to different listing
  router.push(`/listing/${listingId}`);
};

// Function: initiate purchase process by opening order confirmation dialog
const purchaseItem = () => {
  // Prevent user from buying their own listing
  if (listing.value.seller.uid === user.value?.UID) {
    alert('You cannot purchase your own listing!');
    return;
  }

  // Check if listing is still active
  if (listing.value.status !== 'active') {
    alert('This listing is no longer available for purchase.');
    return;
  }

  // Reset order dialog state before opening
  selectedDeliveryMethod.value = '';
  deliveryNote.value = '';
  orderError.value = null;
  orderSuccess.value = false;
  createdOrderId.value = null;

  // Open order confirmation dialog
  orderDialogOpen.value = true;
};

// Function: close order dialog and reset state
const closeOrderDialog = () => {
  orderDialogOpen.value = false;
  selectedDeliveryMethod.value = '';
  deliveryNote.value = '';
  orderError.value = null;
  orderSubmitting.value = false;
};

// Function: submit order to backend
const submitOrder = async () => {
  // Validate delivery method is selected
  if (!selectedDeliveryMethod.value) {
    orderError.value = 'Please select a delivery method';
    return;
  }

  // Validate delivery note if "Other methods" is selected
  if (selectedDeliveryMethod.value === 'Other methods' && !deliveryNote.value.trim()) {
    orderError.value = 'Please provide delivery instructions for "Other methods"';
    return;
  }

  // Validate delivery note length
  if (selectedDeliveryMethod.value === 'Other methods' && deliveryNote.value.length > 500) {
    orderError.value = 'Delivery instructions must not exceed 500 characters';
    return;
  }

  // Clear previous error and start submitting
  orderError.value = null;
  orderSubmitting.value = true;

  try {
    // Call order service to create order
    const response = await orderService.createOrder(
      listing.value.ListID,
      user.value.UID,
      selectedDeliveryMethod.value,
      selectedDeliveryMethod.value === 'Other methods' ? deliveryNote.value : null
    );

    // Check if order creation was successful
    if (response.success) {
      // Order created successfully
      orderSuccess.value = true;
      createdOrderId.value = response.order_id;

      // Update listing status locally to prevent further purchase attempts
      listing.value.status = 'reserved';

      // Show success message for 2 seconds then close dialog
      setTimeout(() => {
        closeOrderDialog();
        // Optionally redirect to orders page
        // router.push('/orders');
      }, 2000);
    } else {
      // Order creation failed, show error message
      orderError.value = response.message || 'Failed to create order. Please try again.';
      orderSubmitting.value = false;
    }

  } catch (error) {
    // Unexpected error occurred
    console.error('Error submitting order:', error);
    orderError.value = 'An unexpected error occurred. Please try again.';
    orderSubmitting.value = false;
  }
};

// Function: format date strings for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  return date.toLocaleDateString('en-US', options);
};

// Function: extract filename from full URL for video element
// Database stores full URL like: http://localhost:3000/api/videos/chair_demo.mp4
// This function extracts just the filename and constructs proper API path
const getVideoUrl = (url) => {
  // Return empty string if no URL provided
  if (!url) return '';

  // If URL doesn't contain 'http', it's already just a filename
  // Construct the full API path and return
  if (!url.includes('http')) {
    return `/api/videos/${url}`;
  }

  // If URL is full format (contains http), extract the filename
  // Split by '/' and get the last part (filename)
  const parts = url.split('/');
  const filename = parts[parts.length - 1];

  // Return the API path with just the filename
  return `/api/videos/${filename}`;
};
</script>

<style scoped>
/* Global styles for detail component */

/* Container: Full height minimum with light gray background */
.min-h-screen {
  background-color: #f9fafb;
}

/* Smooth transitions for all interactive elements */
.transition {
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrollable group containers for smooth scrolling behavior */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>

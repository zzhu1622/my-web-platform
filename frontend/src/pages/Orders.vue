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

            <!-- My Orders Option (Active) -->
            <button
              @click="handleMenuClick('orders')"
              class="w-full text-left px-4 py-3 bg-blue-50 flex items-center gap-2 transition duration-150 text-blue-600 border-t border-gray-200 font-medium"
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
    </header>

    <!-- Main Content Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Page Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">My Orders</h2>
        <p class="text-gray-600 mt-2">View and manage your purchase and sale transactions</p>
      </div>

      <!-- Tab Navigation: Toggle between Bought and Received orders -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <!-- Orders I Bought Tab -->
            <button
              @click="activeTab = 'bought'"
              :class="[
                'flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition duration-200',
                activeTab === 'bought'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Orders I Bought</span>
                <span v-if="buyerOrders.length > 0" class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  {{ buyerOrders.length }}
                </span>
              </div>
            </button>

            <!-- Orders I Received Tab -->
            <button
              @click="activeTab = 'received'"
              :class="[
                'flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition duration-200',
                activeTab === 'received'
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Orders I Received</span>
                <span v-if="sellerOrders.length > 0" class="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                  {{ sellerOrders.length }}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="text-gray-500">Loading orders...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-700 font-medium mb-2">{{ error }}</p>
        <button
          @click="fetchOrders"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>

      <!-- Orders I Bought Section -->
      <div v-else-if="activeTab === 'bought'">
        <!-- Empty State for Buyer Orders -->
        <div v-if="buyerOrders.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p class="text-gray-500 mb-6">You haven't purchased any items yet. Browse the marketplace to find great deals!</p>
          <button
            @click="goBack"
            class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Browse Listings
          </button>
        </div>

        <!-- Buyer Orders List -->
        <div v-else class="space-y-4">
          <OrderCard
            v-for="order in buyerOrders"
            :key="order.order_id"
            :order="order"
            :view-type="'buyer'"
            @view-details="openOrderDetail"
            @cancel-order="handleCancelRequest"
            @accept-cancel="handleAcceptCancel"
            @reject-cancel="handleRejectCancel"
            @write-review="openReviewDialog"
          />
        </div>
      </div>

      <!-- Orders I Received Section -->
      <div v-else-if="activeTab === 'received'">
        <!-- Empty State for Seller Orders -->
        <div v-if="sellerOrders.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No orders received</h3>
          <p class="text-gray-500 mb-6">You haven't received any orders for your listings yet. Make sure your items are listed!</p>
          <button
            @click="handleMenuClick('postlisting')"
            class="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
          >
            Post a Listing
          </button>
        </div>

        <!-- Seller Orders List -->
        <div v-else class="space-y-4">
          <OrderCard
            v-for="order in sellerOrders"
            :key="order.order_id"
            :order="order"
            :view-type="'seller'"
            @view-details="openOrderDetail"
            @complete-order="handleCompleteOrder"
            @cancel-order="handleCancelRequest"
            @accept-cancel="handleAcceptCancel"
            @reject-cancel="handleRejectCancel"
          />
        </div>
      </div>
    </main>

    <!-- Order Detail Dialog -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeOrderDetail"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <!-- Dialog Header -->
        <div class="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">Order Details</h2>
            <button
              @click="closeOrderDetail"
              class="text-white hover:text-gray-200 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Dialog Content -->
        <div class="p-6">
          <!-- Order ID and Status -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <p class="text-sm text-gray-500">Order ID</p>
              <p class="font-mono font-semibold text-lg">{{ selectedOrder.order_id }}</p>
            </div>
            <div :class="getStatusBadgeClass(selectedOrder.order_status)">
              {{ getStatusLabel(selectedOrder.order_status, selectedOrderViewType) }}
            </div>
          </div>

          <!-- Item Information -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex gap-4">
              <!-- Product Image -->
              <div class="w-24 h-24 flex-shrink-0">
                <img
                  v-if="selectedOrder.cover_image"
                  :src="selectedOrder.cover_image"
                  :alt="selectedOrder.title"
                  class="w-full h-full object-cover rounded-lg"
                />
                <div v-else class="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <!-- Product Details -->
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 text-lg mb-1">{{ selectedOrder.title }}</h3>
                <div class="flex items-center gap-2 mb-2">
                  <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                    {{ selectedOrder.category }}
                  </span>
                  <span class="text-gray-500 text-sm capitalize">{{ selectedOrder.condition }}</span>
                </div>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Delivery:</span> {{ selectedOrder.delivery_method }}
                </p>
              </div>
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="border border-gray-200 rounded-lg p-4 mb-6">
            <h4 class="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Item Price:</span>
                <span class="font-medium text-gray-900">${{ selectedOrder.price?.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tax (8%):</span>
                <span class="font-medium text-gray-900">${{ selectedOrder.tax?.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Platform Fee (5%):</span>
                <span class="font-medium text-gray-900">${{ selectedOrder.platform_fee?.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-gray-200">
                <span class="font-semibold text-gray-900">Total:</span>
                <span class="font-bold text-blue-600 text-lg">${{ selectedOrder.total }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="border border-gray-200 rounded-lg p-4 mb-6">
            <h4 class="font-semibold text-gray-900 mb-3">
              {{ selectedOrderViewType === 'buyer' ? 'Seller Information' : 'Buyer Information' }}
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="font-medium text-gray-900">
                  {{ selectedOrderViewType === 'buyer' ? selectedOrder.seller?.name : selectedOrder.buyer?.name }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="text-gray-600">
                  {{ selectedOrderViewType === 'buyer' ? selectedOrder.seller?.email : selectedOrder.buyer?.email }}
                </span>
              </div>
              <div v-if="(selectedOrderViewType === 'buyer' ? selectedOrder.seller?.phone : selectedOrder.buyer?.phone)" class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="text-gray-600">
                  {{ selectedOrderViewType === 'buyer' ? selectedOrder.seller?.phone : selectedOrder.buyer?.phone }}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Timeline -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-semibold text-gray-900 mb-3">Order Timeline</h4>
            <div class="text-sm text-gray-600">
              <p><span class="font-medium">Order Placed:</span> {{ formatDateTime(selectedOrder.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Dialog Actions -->
        <div class="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <div class="flex gap-3 justify-end">
            <button
              @click="closeOrderDetail"
              class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Close
            </button>
            <button
              @click="viewListing(selectedOrder.listing_id)"
              class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              View Listing
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Dialog: Modal for writing a review -->
    <div
      v-if="reviewDialog.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeReviewDialog"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <!-- Dialog Header -->
        <div class="bg-yellow-500 text-white px-6 py-4 rounded-t-lg">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Write a Review
            </h3>
            <button
              @click="closeReviewDialog"
              class="text-white hover:text-gray-200 transition"
              :disabled="reviewDialog.processing"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Dialog Content -->
        <div class="p-6">
          <!-- Order Info Summary -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex gap-4">
              <div class="w-16 h-16 flex-shrink-0">
                <img
                  v-if="reviewDialog.order?.cover_image"
                  :src="reviewDialog.order.cover_image"
                  :alt="reviewDialog.order.title"
                  class="w-full h-full object-cover rounded-lg"
                />
                <div v-else class="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">{{ reviewDialog.order?.title }}</h4>
                <p class="text-sm text-gray-500">Order #{{ reviewDialog.order?.order_id }}</p>
                <p class="text-sm text-gray-500">Seller: {{ reviewDialog.order?.seller?.name }}</p>
              </div>
            </div>
          </div>

          <!-- Rating Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rating <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <template v-for="star in 5" :key="star">
                <button
                  @click="reviewDialog.rating = star"
                  @mouseenter="reviewDialog.hoverRating = star"
                  @mouseleave="reviewDialog.hoverRating = 0"
                  class="focus:outline-none transition transform hover:scale-110"
                  :disabled="reviewDialog.processing"
                >
                  <svg
                    class="w-8 h-8"
                    :class="[
                      (reviewDialog.hoverRating || reviewDialog.rating) >= star
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    ]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </template>
              <span class="ml-2 text-sm text-gray-600">
                {{ getRatingLabel(reviewDialog.hoverRating || reviewDialog.rating) }}
              </span>
            </div>
            <p v-if="!reviewDialog.rating && reviewDialog.showValidation" class="text-sm text-red-500 mt-1">
              Please select a rating
            </p>
          </div>

          <!-- Comment Input -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Comment <span class="text-gray-400">(optional)</span>
            </label>
            <textarea
              v-model="reviewDialog.comment"
              :disabled="reviewDialog.processing"
              rows="4"
              maxlength="2000"
              placeholder="Share your experience with this purchase..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition disabled:bg-gray-100"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1 text-right">
              {{ reviewDialog.comment?.length || 0 }} / 2000 characters
            </p>
          </div>

          <!-- Processing State -->
          <div v-if="reviewDialog.processing" class="flex items-center gap-2 text-gray-500 mb-4">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
            <span>Submitting review...</span>
          </div>

          <!-- Error Message -->
          <div v-if="reviewDialog.error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-red-700">{{ reviewDialog.error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="reviewDialog.success" class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-green-700">{{ reviewDialog.success }}</p>
          </div>

          <!-- Important Notice -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p class="text-xs text-yellow-800">
              <strong>Note:</strong> Once submitted, your review cannot be edited or deleted.
            </p>
          </div>
        </div>

        <!-- Dialog Actions -->
        <div class="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end">
          <button
            @click="closeReviewDialog"
            :disabled="reviewDialog.processing"
            class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            {{ reviewDialog.success ? 'Close' : 'Cancel' }}
          </button>
          <button
            v-if="!reviewDialog.success"
            @click="submitReview"
            :disabled="reviewDialog.processing"
            class="px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Submit Review
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog for Actions -->
    <div
      v-if="confirmDialog.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeConfirmDialog"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <!-- Dialog Header -->
        <div :class="['px-6 py-4 rounded-t-lg', confirmDialog.type === 'danger' ? 'bg-red-600' : 'bg-blue-600']">
          <h3 class="text-lg font-bold text-white">{{ confirmDialog.title }}</h3>
        </div>

        <!-- Dialog Content -->
        <div class="p-6">
          <p class="text-gray-700">{{ confirmDialog.message }}</p>

          <!-- Processing State -->
          <div v-if="confirmDialog.processing" class="mt-4 flex items-center gap-2 text-gray-500">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Processing...</span>
          </div>

          <!-- Error Message -->
          <div v-if="confirmDialog.error" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-700">{{ confirmDialog.error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="confirmDialog.success" class="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-sm text-green-700">{{ confirmDialog.success }}</p>
          </div>
        </div>

        <!-- Dialog Actions -->
        <div class="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end">
          <button
            @click="closeConfirmDialog"
            :disabled="confirmDialog.processing"
            class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            {{ confirmDialog.success ? 'Close' : 'Cancel' }}
          </button>
          <button
            v-if="!confirmDialog.success"
            @click="confirmDialog.onConfirm"
            :disabled="confirmDialog.processing"
            :class="[
              'px-4 py-2 font-medium rounded-lg transition disabled:opacity-50',
              confirmDialog.type === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            ]"
          >
            {{ confirmDialog.confirmText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Section -->
    <footer class="bg-gray-900 text-gray-300 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <p>2025 AptExchange. All rights reserved. CSC 4710 Database Systems Project.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import orderService from '../services/orderService';
import reviewService from '../services/reviewService';
import OrderCard from '../components/OrderCard.vue';

// Vue Router instance for navigation
const router = useRouter();

// Component state variables
const user = ref(null);
const showUserMenu = ref(false);
const loading = ref(true);
const error = ref(null);

// Tab state: controls which order section is visible
const activeTab = ref('bought');

// Order data arrays
const buyerOrders = ref([]);
const sellerOrders = ref([]);

// Order detail dialog state
const selectedOrder = ref(null);
const selectedOrderViewType = ref('buyer');

// Review dialog state
const reviewDialog = ref({
  show: false,
  order: null,
  rating: 0,
  hoverRating: 0,
  comment: '',
  processing: false,
  error: null,
  success: null,
  showValidation: false
});

// Confirmation dialog state for order actions
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  type: 'default',
  processing: false,
  error: null,
  success: null,
  onConfirm: () => {}
});

// Function: Navigate back to home page
const goBack = () => {
  router.push('/home');
};

// Function: Handle user menu click events
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
      // Already on orders page
      break;
    case 'postlisting':
      // Route to post listing form where user can create new marketplace listing
      router.push('/post-listing');
      break;
    case 'logout':
      handleLogout();
      break;
    default:
      break;
  }
};

// Function: Handle logout and redirect to login page
const handleLogout = () => {
  authService.logout();
  router.push('/');
};

// Function: Fetch all orders (both buyer and seller)
const fetchOrders = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch buyer orders (orders placed by current user)
    const buyerResponse = await orderService.getBuyerOrders(user.value.UID);
    if (buyerResponse.success) {
      buyerOrders.value = buyerResponse.orders;
    } else {
      console.error('Failed to fetch buyer orders:', buyerResponse.message);
    }

    // Fetch seller orders (orders for listings owned by current user)
    const sellerResponse = await orderService.getSellerOrders(user.value.UID);
    if (sellerResponse.success) {
      sellerOrders.value = sellerResponse.orders;
    } else {
      console.error('Failed to fetch seller orders:', sellerResponse.message);
    }

  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = 'Failed to load orders. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Function: Open order detail dialog
const openOrderDetail = (order, viewType) => {
  selectedOrder.value = order;
  selectedOrderViewType.value = viewType;
};

// Function: Close order detail dialog
const closeOrderDetail = () => {
  selectedOrder.value = null;
  selectedOrderViewType.value = 'buyer';
};

// Function: Navigate to listing detail page
const viewListing = (listingId) => {
  closeOrderDetail();
  router.push(`/listing/${listingId}`);
};

// Function: Get status badge CSS class based on order status
const getStatusBadgeClass = (status) => {
  const baseClass = 'px-3 py-1 rounded-full text-sm font-medium';

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

// Function: Format date-time for display
const formatDateTime = (dateString) => {
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

// Function: Close confirmation dialog
const closeConfirmDialog = () => {
  confirmDialog.value = {
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'default',
    processing: false,
    error: null,
    success: null,
    onConfirm: () => {}
  };
};

// Function: Handle complete order action (seller marks as delivered)
const handleCompleteOrder = (order) => {
  confirmDialog.value = {
    show: true,
    title: 'Complete Order',
    message: `Are you sure you want to mark this order as completed? This confirms that the item "${order.title}" has been delivered to the buyer.`,
    confirmText: 'Mark as Completed',
    type: 'default',
    processing: false,
    error: null,
    success: null,
    onConfirm: async () => {
      confirmDialog.value.processing = true;
      confirmDialog.value.error = null;

      try {
        const response = await orderService.completeOrder(order.order_id, user.value.UID);

        if (response.success) {
          confirmDialog.value.success = 'Order marked as completed successfully!';
          // Refresh orders after short delay
          setTimeout(() => {
            closeConfirmDialog();
            fetchOrders();
          }, 1500);
        } else {
          confirmDialog.value.error = response.message || 'Failed to complete order';
          confirmDialog.value.processing = false;
        }
      } catch (err) {
        confirmDialog.value.error = 'An unexpected error occurred';
        confirmDialog.value.processing = false;
      }
    }
  };
};

// Function: Handle cancel order request
const handleCancelRequest = (order, viewType) => {
  const isBuyer = viewType === 'buyer';

  confirmDialog.value = {
    show: true,
    title: 'Request Cancellation',
    message: `Are you sure you want to request cancellation for this order? The ${isBuyer ? 'seller' : 'buyer'} will need to accept your request for the order to be cancelled.`,
    confirmText: 'Request Cancellation',
    type: 'danger',
    processing: false,
    error: null,
    success: null,
    onConfirm: async () => {
      confirmDialog.value.processing = true;
      confirmDialog.value.error = null;

      try {
        const response = await orderService.requestCancelOrder(order.order_id, user.value.UID);

        if (response.success) {
          confirmDialog.value.success = 'Cancellation request submitted successfully!';
          setTimeout(() => {
            closeConfirmDialog();
            fetchOrders();
          }, 1500);
        } else {
          confirmDialog.value.error = response.message || 'Failed to submit cancellation request';
          confirmDialog.value.processing = false;
        }
      } catch (err) {
        confirmDialog.value.error = 'An unexpected error occurred';
        confirmDialog.value.processing = false;
      }
    }
  };
};

// Function: Handle accept cancellation request
const handleAcceptCancel = (order) => {
  confirmDialog.value = {
    show: true,
    title: 'Accept Cancellation',
    message: `Are you sure you want to accept the cancellation request? The order for "${order.title}" will be cancelled and the item will be available for purchase again.`,
    confirmText: 'Accept Cancellation',
    type: 'danger',
    processing: false,
    error: null,
    success: null,
    onConfirm: async () => {
      confirmDialog.value.processing = true;
      confirmDialog.value.error = null;

      try {
        const response = await orderService.acceptCancelOrder(order.order_id, user.value.UID);

        if (response.success) {
          confirmDialog.value.success = 'Order has been cancelled successfully!';
          setTimeout(() => {
            closeConfirmDialog();
            fetchOrders();
          }, 1500);
        } else {
          confirmDialog.value.error = response.message || 'Failed to accept cancellation';
          confirmDialog.value.processing = false;
        }
      } catch (err) {
        confirmDialog.value.error = 'An unexpected error occurred';
        confirmDialog.value.processing = false;
      }
    }
  };
};

// Function: Handle reject cancellation request
const handleRejectCancel = (order) => {
  confirmDialog.value = {
    show: true,
    title: 'Reject Cancellation',
    message: `Are you sure you want to reject the cancellation request? The order will remain active and the item will stay reserved.`,
    confirmText: 'Reject Cancellation',
    type: 'default',
    processing: false,
    error: null,
    success: null,
    onConfirm: async () => {
      confirmDialog.value.processing = true;
      confirmDialog.value.error = null;

      try {
        const response = await orderService.rejectCancelOrder(order.order_id, user.value.UID);

        if (response.success) {
          confirmDialog.value.success = 'Cancellation request has been rejected!';
          setTimeout(() => {
            closeConfirmDialog();
            fetchOrders();
          }, 1500);
        } else {
          confirmDialog.value.error = response.message || 'Failed to reject cancellation';
          confirmDialog.value.processing = false;
        }
      } catch (err) {
        confirmDialog.value.error = 'An unexpected error occurred';
        confirmDialog.value.processing = false;
      }
    }
  };
};

// =====================================================
// REVIEW FUNCTIONALITY
// =====================================================

// Function: Open review dialog for a completed order
const openReviewDialog = (order) => {
  reviewDialog.value = {
    show: true,
    order: order,
    rating: 0,
    hoverRating: 0,
    comment: '',
    processing: false,
    error: null,
    success: null,
    showValidation: false
  };
};

// Function: Close review dialog and reset state
const closeReviewDialog = () => {
  // If review was successfully submitted, refresh orders to show the new review
  if (reviewDialog.value.success) {
    fetchOrders();
  }

  reviewDialog.value = {
    show: false,
    order: null,
    rating: 0,
    hoverRating: 0,
    comment: '',
    processing: false,
    error: null,
    success: null,
    showValidation: false
  };
};

// Function: Get rating label text based on selected rating
const getRatingLabel = (rating) => {
  switch (rating) {
    case 1:
      return 'Poor';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Very Good';
    case 5:
      return 'Excellent';
    default:
      return 'Select a rating';
  }
};

// Function: Submit review to backend
const submitReview = async () => {
  // Show validation errors if rating not selected
  reviewDialog.value.showValidation = true;

  // Validate rating is selected
  if (!reviewDialog.value.rating) {
    return;
  }

  reviewDialog.value.processing = true;
  reviewDialog.value.error = null;

  try {
    // Call review service to submit review
    const response = await reviewService.createReview(
      reviewDialog.value.order.order_id,
      user.value.UID,
      reviewDialog.value.rating,
      reviewDialog.value.comment.trim() || null
    );

    if (response.success) {
      reviewDialog.value.success = 'Your review has been submitted successfully. Thank you for your feedback!';
      reviewDialog.value.processing = false;
    } else {
      reviewDialog.value.error = response.message || 'Failed to submit review. Please try again.';
      reviewDialog.value.processing = false;
    }
  } catch (err) {
    console.error('Error submitting review:', err);
    reviewDialog.value.error = 'An unexpected error occurred. Please try again.';
    reviewDialog.value.processing = false;
  }
};

// Lifecycle Hook: Runs when component is mounted to DOM
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

  // Fetch orders
  await fetchOrders();
});
</script>

<style scoped>
/* Container: Full height minimum with light gray background */
.min-h-screen {
  background-color: #f9fafb;
}

/* Smooth transitions for all interactive elements */
.transition {
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

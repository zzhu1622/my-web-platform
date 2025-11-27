<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header Section -->
    <header class="bg-white shadow-md sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left Side: Back Button and Logo -->
          <div class="flex items-center gap-4">
            <!-- Back to Home Button -->
            <button
              @click="goBack"
              class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span class="font-medium">Back</span>
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
                  {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                </span>
              </div>
              <span class="font-medium hidden sm:block">{{ user?.name || 'User' }}</span>
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
              <!-- My Account Option (Active) -->
              <button
                @click="handleMenuClick('account')"
                class="w-full text-left px-4 py-3 bg-blue-50 flex items-center gap-2 transition duration-150 text-blue-600 font-medium"
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
    <main class="max-w-7xl mx-120 px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Account</h1>
        <p class="text-gray-600 mt-2">Manage your profile, password, and listings</p>
      </div>

      <!-- Account Layout: Sidebar Tabs + Content Area -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Left Sidebar: Tab Navigation -->
        <div class="lg:w-64 flex-shrink-0">
          <nav class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Overview Tab -->
            <button
              @click="activeTab = 'overview'"
              :class="[
                'w-full text-left px-4 py-4 flex items-center gap-3 transition duration-200 border-l-4',
                activeTab === 'overview'
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span class="font-medium">Overview</span>
            </button>

            <!-- Personal Information Tab -->
            <button
              @click="activeTab = 'personal'"
              :class="[
                'w-full text-left px-4 py-4 flex items-center gap-3 transition duration-200 border-l-4 border-t border-gray-100',
                activeTab === 'personal'
                  ? 'bg-blue-50 border-l-blue-600 text-blue-600'
                  : 'border-l-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-medium">Personal Information</span>
            </button>

            <!-- Listing Management Tab -->
            <button
              @click="activeTab = 'listings'"
              :class="[
                'w-full text-left px-4 py-4 flex items-center gap-3 transition duration-200 border-l-4 border-t border-gray-100',
                activeTab === 'listings'
                  ? 'bg-blue-50 border-l-blue-600 text-blue-600'
                  : 'border-l-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="font-medium">Listing Management</span>
            </button>
          </nav>
        </div>

        <!-- Right Content Area -->
        <div class="flex-1">
          <!-- Loading State -->
          <div v-if="loading" class="bg-white rounded-lg shadow-md p-8">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span class="ml-3 text-gray-600">Loading...</span>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-white rounded-lg shadow-md p-8">
            <div class="text-center">
              <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-red-600 font-medium">{{ error }}</p>
              <button
                @click="loadTabData"
                class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>

          <!-- Overview Tab Content -->
          <div v-else-if="activeTab === 'overview'" class="space-y-6">
            <!-- User Profile Card -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Public Profile</h2>
              <div class="flex items-start gap-6">
                <!-- Avatar -->
                <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-blue-600 font-bold text-3xl">
                    {{ overviewData.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                  </span>
                </div>

                <!-- User Info -->
                <div class="flex-1">
                  <h3 class="text-2xl font-bold text-gray-900">{{ overviewData.user?.name || 'Unknown' }}</h3>
                  <div class="mt-2 space-y-1">
                    <p class="text-gray-600 flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {{ overviewData.user?.email || 'No email' }}
                    </p>
                    <p class="text-gray-600 flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {{ overviewData.user?.phone || 'No phone' }}
                    </p>
                  </div>
                </div>

                <!-- Stats Summary -->
                <div class="flex gap-6">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600">{{ overviewData.stats?.active_listings || 0 }}</div>
                    <div class="text-sm text-gray-500">Active Listings</div>
                  </div>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-green-600">{{ overviewData.stats?.items_sold || 0 }}</div>
                    <div class="text-sm text-gray-500">Items Sold</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Score Card -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Seller Rating</h2>
              <div class="flex items-center gap-6">
                <!-- Rating Display -->
                <div class="flex items-center gap-2">
                  <div class="text-5xl font-bold text-yellow-500">
                    {{ overviewData.stats?.total_score || '0.0' }}
                  </div>
                  <div class="flex flex-col">
                    <!-- Star Icons -->
                    <div class="flex items-center">
                      <template v-for="star in 5" :key="star">
                        <svg
                          class="w-5 h-5"
                          :class="star <= Math.round(overviewData.stats?.total_score || 0) ? 'text-yellow-400' : 'text-gray-300'"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </template>
                    </div>
                    <span class="text-sm text-gray-500">{{ overviewData.stats?.review_count || 0 }} reviews</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews Received Section -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Reviews Received</h2>

              <!-- No Reviews Message -->
              <div v-if="!overviewData.reviews || overviewData.reviews.length === 0" class="text-center py-8">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p class="text-gray-500">No reviews yet</p>
                <p class="text-gray-400 text-sm mt-1">Reviews from buyers will appear here after completed transactions</p>
              </div>

              <!-- Reviews List -->
              <div v-else class="space-y-4">
                <div
                  v-for="review in overviewData.reviews"
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
                      <p class="text-sm text-gray-500 mt-1">For: {{ review.item_title }}</p>
                    </div>
                    <span class="text-sm text-gray-400">{{ formatDate(review.review_date) }}</span>
                  </div>
                  <p v-if="review.comment" class="text-gray-700 mt-2">{{ review.comment }}</p>
                  <p v-else class="text-gray-400 italic mt-2">No comment provided</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Information Tab Content -->
          <div v-else-if="activeTab === 'personal'" class="space-y-6">
            <!-- Profile Information Card -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- UID (Read-only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <div class="bg-gray-100 px-4 py-3 rounded-lg text-gray-900">
                    {{ profileData.UID || 'N/A' }}
                  </div>
                </div>

                <!-- Name (Read-only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div class="bg-gray-100 px-4 py-3 rounded-lg text-gray-900">
                    {{ profileData.name || 'N/A' }}
                  </div>
                </div>

                <!-- Email (Read-only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div class="bg-gray-100 px-4 py-3 rounded-lg text-gray-900">
                    {{ profileData.email || 'N/A' }}
                  </div>
                </div>

                <!-- Phone (Read-only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div class="bg-gray-100 px-4 py-3 rounded-lg text-gray-900">
                    {{ profileData.phone || 'N/A' }}
                  </div>
                </div>

                <!-- Move-out Date (Read-only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Move-out Date</label>
                  <div class="bg-gray-100 px-4 py-3 rounded-lg text-gray-900">
                    {{ profileData.move_out_date ? formatDate(profileData.move_out_date) : 'Not set' }}
                  </div>
                </div>

                <!-- Password (Masked) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div class="bg-gray-100 px-4 py-3 rounded-lg text-gray-900">
                    ********
                  </div>
                </div>
              </div>
            </div>

            <!-- Change Password Card -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

              <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-md">
                <!-- Current Password -->
                <div>
                  <label for="oldPassword" class="block text-sm font-medium text-gray-700 mb-1">
                    Current Password <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    v-model="passwordForm.oldPassword"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <!-- New Password -->
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                    New Password <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password (min 6 characters)"
                    minlength="6"
                    required
                  />
                </div>

                <!-- Confirm New Password -->
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    minlength="6"
                    required
                  />
                </div>

                <!-- Error Message -->
                <div v-if="passwordError" class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p class="text-red-600 text-sm">{{ passwordError }}</p>
                </div>

                <!-- Success Message -->
                <div v-if="passwordSuccess" class="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p class="text-green-600 text-sm">{{ passwordSuccess }}</p>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  :disabled="passwordLoading"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span v-if="passwordLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>{{ passwordLoading ? 'Updating...' : 'Update Password' }}</span>
                </button>
              </form>
            </div>
          </div>

          <!-- Listing Management Tab Content -->
          <div v-else-if="activeTab === 'listings'" class="space-y-6">
            <!-- Listings Header -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">My Listings</h2>
                  <p class="text-gray-500 text-sm mt-1">{{ listingsData.length }} listing(s) found</p>
                </div>
                <button
                  @click="router.push('/post-listing')"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Post New Listing</span>
                </button>
              </div>
            </div>

            <!-- No Listings Message -->
            <div v-if="listingsData.length === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="text-gray-500">You have no listings yet</p>
              <button
                @click="router.push('/post-listing')"
                class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Listing
              </button>
            </div>

            <!-- Listings Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="listing in listingsData"
                :key="listing.list_id"
                class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div class="flex">
                  <!-- Cover Image -->
                  <div class="w-32 h-32 flex-shrink-0 bg-gray-200">
                    <img
                      v-if="listing.cover_image"
                      :src="getImageUrl(listing.cover_image)"
                      :alt="listing.title"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  <!-- Listing Info -->
                  <div class="flex-1 p-4">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="font-semibold text-gray-900 line-clamp-1">{{ listing.title }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                            {{ listing.category }}
                          </span>
                          <span
                            :class="[
                              'px-2 py-0.5 rounded text-xs font-medium',
                              getStatusClass(listing.listing_status)
                            ]"
                          >
                            {{ formatStatus(listing.listing_status) }}
                          </span>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-bold text-blue-600">${{ listing.selling_price }}</p>
                      </div>
                    </div>

                    <div class="mt-2 flex items-center justify-between">
                      <span class="text-sm text-gray-500">
                        Expires: {{ formatDate(listing.expire_date) }}
                      </span>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-3 flex items-center gap-2">
                      <!-- View Button -->
                      <button
                        @click="viewListing(listing.list_id)"
                        class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center gap-1"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>

                      <!-- Edit Button -->
                      <button
                        v-if="listing.can_edit"
                        @click="openEditDialog(listing)"
                        class="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center gap-1"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>

                      <!-- Delete Button -->
                      <button
                        v-if="listing.can_delete"
                        @click="openDeleteDialog(listing)"
                        class="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition flex items-center gap-1"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>

                      <!-- Cannot Edit/Delete Indicator -->
                      <span
                        v-if="listing.order_count > 0"
                        class="text-xs text-gray-400 ml-2"
                      >
                        (Has {{ listing.order_count }} order(s))
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="deleteDialog.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style="background-color: rgba(0, 0, 0, 0.5);"
      @click.self="deleteDialog.show = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">Delete Listing</h3>
        </div>

        <p class="text-gray-600 mb-4">
          Are you sure you want to delete "<strong>{{ deleteDialog.listing?.title }}</strong>"?
          This action cannot be undone and will also delete the associated item and media files.
        </p>

        <!-- Error Message -->
        <div v-if="deleteDialog.error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p class="text-red-600 text-sm">{{ deleteDialog.error }}</p>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="deleteDialog.show = false"
            :disabled="deleteDialog.processing"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleteDialog.processing"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <span v-if="deleteDialog.processing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            <span>{{ deleteDialog.processing ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Listing Dialog -->
    <div
      v-if="editDialog.show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      @click.self="editDialog.show = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Edit Listing</h3>
          <button
            @click="editDialog.show = false"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleUpdateListing" class="space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Title <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="editForm.title"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <!-- Category and Condition -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Category <span class="text-red-500">*</span>
              </label>
              <select
                v-model="editForm.category"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Condition <span class="text-red-500">*</span>
              </label>
              <select
                v-model="editForm.condition"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select condition</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <!-- Prices -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Selling Price <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                v-model="editForm.selling_price"
                step="0.01"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
              <input
                type="number"
                v-model="editForm.original_price"
                step="0.01"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="editForm.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your item..."
            ></textarea>
          </div>

          <!-- Condition Details -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Condition Details</label>
            <textarea
              v-model="editForm.condition_details"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any scratches, wear, or defects..."
            ></textarea>
          </div>

          <!-- Expire Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Expire Date <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              v-model="editForm.expire_date"
              :min="getTodayDate()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <!-- Error Message -->
          <div v-if="editDialog.error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ editDialog.error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="editDialog.success" class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-green-600 text-sm">{{ editDialog.success }}</p>
          </div>

          <!-- Submit Buttons -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="editDialog.show = false"
              :disabled="editDialog.processing"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="editDialog.processing"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span v-if="editDialog.processing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>{{ editDialog.processing ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-400">2024 AptExchange. All rights reserved. CSC 4710 Database Systems Project.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import accountService from '../services/accountService';

// Vue Router instance for navigation
const router = useRouter();

// User data from localStorage
const user = ref(null);

// UI state
const showUserMenu = ref(false);
const loading = ref(true);
const error = ref(null);

// Active tab: controls which section is visible
const activeTab = ref('overview');

// Tab data storage
const overviewData = ref({
    user: null,
    reviews: [],
    stats: null
});

const profileData = ref({});

const listingsData = ref([]);

// Password change form state
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});
const passwordLoading = ref(false);
const passwordError = ref(null);
const passwordSuccess = ref(null);

// Delete dialog state
const deleteDialog = ref({
    show: false,
    listing: null,
    processing: false,
    error: null
});

// Edit dialog state
const editDialog = ref({
    show: false,
    listing: null,
    processing: false,
    error: null,
    success: null
});

// Edit form data
const editForm = ref({
    title: '',
    category: '',
    condition: '',
    selling_price: null,
    original_price: null,
    description: '',
    condition_details: '',
    expire_date: ''
});

// API URL for images
const API_URL = import.meta.env.VITE_API_URL;

// Function: Navigate back to home page
const goBack = () => {
    router.push('/home');
};

// Function: Handle user menu click events
const handleMenuClick = (action) => {
    showUserMenu.value = false;

    switch (action) {
        case 'account':
            // Already on account page
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

// Function: Handle logout
const handleLogout = () => {
    authService.logout();
    router.push('/');
};

// Function: Load data for the current active tab
const loadTabData = async () => {
    if (!user.value) return;

    loading.value = true;
    error.value = null;

    try {
        if (activeTab.value === 'overview') {
            const response = await accountService.getUserOverview(user.value.UID);
            if (response.success) {
                overviewData.value = {
                    user: response.user,
                    reviews: response.reviews,
                    stats: response.stats
                };
            } else {
                error.value = response.message || 'Failed to load overview';
            }
        } else if (activeTab.value === 'personal') {
            const response = await accountService.getUserProfile(user.value.UID);
            if (response.success) {
                profileData.value = response.user;
            } else {
                error.value = response.message || 'Failed to load profile';
            }
        } else if (activeTab.value === 'listings') {
            const response = await accountService.getUserListings(user.value.UID);
            if (response.success) {
                listingsData.value = response.listings;
            } else {
                error.value = response.message || 'Failed to load listings';
            }
        }
    } catch (err) {
        console.error('Error loading tab data:', err);
        error.value = 'An unexpected error occurred';
    } finally {
        loading.value = false;
    }
};

// Watch for tab changes and load appropriate data
watch(activeTab, () => {
    loadTabData();
});

// Function: Format date for display
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Function: Get image URL
const getImageUrl = (filename) => {
    if (!filename) return '';
    if (filename.startsWith('http')) return filename;
    return `${API_URL}/images/${filename}`;
};

// Function: Handle image loading errors
const handleImageError = (event) => {
    event.target.style.display = 'none';
};

// Function: Get status CSS class
const getStatusClass = (status) => {
    const classes = {
        active: 'bg-green-100 text-green-800',
        reserved: 'bg-yellow-100 text-yellow-800',
        sold: 'bg-gray-100 text-gray-800',
        expired: 'bg-red-100 text-red-800'
    };
    return classes[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Function: Format status for display
const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Function: Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Function: View listing details
const viewListing = (listId) => {
    router.push(`/listing/${listId}`);
};

// Function: Handle password change
const handleChangePassword = async () => {
    passwordError.value = null;
    passwordSuccess.value = null;

    // Validate passwords match
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        passwordError.value = 'New password and confirm password do not match';
        return;
    }

    // Validate password length
    if (passwordForm.value.newPassword.length < 6) {
        passwordError.value = 'New password must be at least 6 characters long';
        return;
    }

    passwordLoading.value = true;

    try {
        const response = await accountService.changePassword(
            user.value.UID,
            passwordForm.value.oldPassword,
            passwordForm.value.newPassword,
            passwordForm.value.confirmPassword
        );

        if (response.success) {
            passwordSuccess.value = 'Password updated successfully';
            // Clear form
            passwordForm.value = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        } else {
            passwordError.value = response.message || 'Failed to update password';
        }
    } catch (err) {
        console.error('Error changing password:', err);
        passwordError.value = 'An unexpected error occurred';
    } finally {
        passwordLoading.value = false;
    }
};

// Function: Open delete confirmation dialog
const openDeleteDialog = (listing) => {
    deleteDialog.value = {
        show: true,
        listing: listing,
        processing: false,
        error: null
    };
};

// Function: Confirm and execute delete
const confirmDelete = async () => {
    if (!deleteDialog.value.listing) return;

    deleteDialog.value.processing = true;
    deleteDialog.value.error = null;

    try {
        const response = await accountService.deleteListing(
            deleteDialog.value.listing.list_id,
            user.value.UID
        );

        if (response.success) {
            // Remove listing from local array
            listingsData.value = listingsData.value.filter(
                l => l.list_id !== deleteDialog.value.listing.list_id
            );
            deleteDialog.value.show = false;
        } else {
            deleteDialog.value.error = response.message || 'Failed to delete listing';
        }
    } catch (err) {
        console.error('Error deleting listing:', err);
        deleteDialog.value.error = 'An unexpected error occurred';
    } finally {
        deleteDialog.value.processing = false;
    }
};

// Function: Open edit dialog with pre-filled form
const openEditDialog = async (listing) => {
    editDialog.value = {
        show: true,
        listing: listing,
        processing: false,
        error: null,
        success: null
    };

    // Pre-fill form with listing data
    editForm.value = {
        title: listing.title || '',
        category: listing.category || '',
        condition: listing.condition || '',
        selling_price: listing.selling_price || null,
        original_price: listing.original_price || null,
        description: listing.item_description || '',
        condition_details: listing.condition_details || '',
        expire_date: listing.expire_date ? listing.expire_date.split('T')[0] : ''
    };
};

// Function: Handle listing update
const handleUpdateListing = async () => {
    editDialog.value.processing = true;
    editDialog.value.error = null;
    editDialog.value.success = null;

    try {
        const response = await accountService.updateListing(
            editDialog.value.listing.list_id,
            {
                uid: user.value.UID,
                title: editForm.value.title,
                category: editForm.value.category,
                condition: editForm.value.condition,
                selling_price: editForm.value.selling_price,
                original_price: editForm.value.original_price || null,
                description: editForm.value.description,
                condition_details: editForm.value.condition_details,
                expire_date: editForm.value.expire_date
            }
        );

        if (response.success) {
            editDialog.value.success = 'Listing updated successfully';

            // Update local listing data
            const index = listingsData.value.findIndex(
                l => l.list_id === editDialog.value.listing.list_id
            );
            if (index !== -1) {
                listingsData.value[index] = {
                    ...listingsData.value[index],
                    title: editForm.value.title,
                    category: editForm.value.category,
                    condition: editForm.value.condition,
                    selling_price: editForm.value.selling_price,
                    original_price: editForm.value.original_price,
                    item_description: editForm.value.description,
                    condition_details: editForm.value.condition_details,
                    expire_date: editForm.value.expire_date
                };
            }

            // Close dialog after a short delay
            setTimeout(() => {
                editDialog.value.show = false;
            }, 1500);
        } else {
            editDialog.value.error = response.message || 'Failed to update listing';
        }
    } catch (err) {
        console.error('Error updating listing:', err);
        editDialog.value.error = 'An unexpected error occurred';
    } finally {
        editDialog.value.processing = false;
    }
};

// Lifecycle: Load user data and initial tab data on mount
onMounted(async () => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        router.push('/');
        return;
    }

    try {
        user.value = JSON.parse(storedUser);
        await loadTabData();
    } catch (err) {
        console.error('Error parsing user data:', err);
        router.push('/');
    }
});
</script>

<style scoped>
/* Line clamp utility for text truncation */
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Custom scrollbar for dialog */
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

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

            <!-- Post Listing Option (Active) -->
            <button
              @click="handleMenuClick('postlisting')"
              class="w-full text-left px-4 py-3 bg-blue-50 flex items-center gap-2 transition duration-150 text-blue-600 border-t border-gray-200 font-medium"
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
        <h2 class="text-3xl font-bold text-gray-900">Post a New Listing</h2>
        <p class="text-gray-600 mt-2">Sell your items to your apartment neighbors</p>
      </div>

      <!-- Main Content Grid: Form on left, Pricing Reference on right -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left Column: Listing Form (2/3 width on large screens) -->
        <div class="lg:col-span-2">

          <!-- Media Upload Section -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Photos and Videos</h3>
            <p class="text-sm text-gray-600 mb-4">
              Upload at least 1 photo. You can add up to 9 media files total (including 1 video max).
            </p>

            <!-- Media Upload Area -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-200">

              <!-- Upload Input (hidden, triggered by button) -->
              <input
                type="file"
                ref="mediaInput"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                class="hidden"
                @change="handleMediaUpload"
              />

              <!-- Upload Icon and Text -->
              <div v-if="uploadedMedia.length === 0" class="cursor-pointer" @click="triggerMediaUpload">
                <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="mt-4 text-lg font-medium text-gray-700">Click to upload photos or videos</p>
                <p class="mt-2 text-sm text-gray-500">JPEG, PNG, GIF, WebP for images; MP4, WebM, MOV for videos</p>
                <p class="mt-1 text-sm text-gray-500">Max file size: 10MB for images, 50MB for videos</p>
              </div>

              <!-- Uploaded Media Preview Grid -->
              <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-4">
                <!-- Media Item Preview -->
                <div
                  v-for="(media, index) in uploadedMedia"
                  :key="index"
                  class="relative group"
                >
                  <!-- Image Preview -->
                  <div v-if="media.type === 'image'" class="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      :src="media.previewUrl"
                      :alt="'Uploaded image ' + (index + 1)"
                      class="w-full h-full object-cover"
                    />
                    <!-- Cover Badge for first image -->
                    <div
                      v-if="index === 0"
                      class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Cover
                    </div>
                  </div>

                  <!-- Video Preview -->
                  <div v-else class="relative aspect-square rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    <video
                      :src="media.previewUrl"
                      class="w-full h-full object-cover"
                    ></video>
                    <!-- Video Play Icon Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <!-- Video Badge -->
                    <div class="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      Video
                    </div>
                  </div>

                  <!-- Remove Button (appears on hover) -->
                  <button
                    @click="removeMedia(index)"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition duration-200 hover:bg-red-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Add More Button (if under limit) -->
                <button
                  v-if="uploadedMedia.length < 9"
                  @click="triggerMediaUpload"
                  class="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition duration-200"
                >
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Media Counter -->
            <div class="mt-4 flex items-center justify-between text-sm">
              <span :class="uploadedMedia.length === 0 ? 'text-red-500' : 'text-gray-600'">
                {{ uploadedMedia.filter(m => m.type === 'image').length }} photo(s) uploaded
                <span v-if="uploadedMedia.some(m => m.type === 'video')" class="ml-2">
                  (1 video)
                </span>
              </span>
              <span class="text-gray-500">{{ uploadedMedia.length }}/9 files</span>
            </div>

            <!-- Media Validation Error -->
            <p v-if="mediaError" class="mt-2 text-sm text-red-500">{{ mediaError }}</p>
          </div>

          <!-- Item Information Section -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Item Information</h3>

            <!-- Title Field -->
            <div class="mb-6">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Title <span class="text-red-500">*</span>
              </label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                maxlength="150"
                placeholder="e.g., IKEA KALLAX Bookshelf - White"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                :class="{ 'border-red-500': formErrors.title }"
              />
              <p v-if="formErrors.title" class="mt-1 text-sm text-red-500">{{ formErrors.title }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ formData.title.length }}/150 characters</p>
            </div>

            <!-- Category Field -->
            <div class="mb-6">
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                Category <span class="text-red-500">*</span>
              </label>
              <select
                id="category"
                v-model="formData.category"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                :class="{ 'border-red-500': formErrors.category }"
                @change="handleCategoryChange"
              >
                <option value="">Select a category</option>
                <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                <option value="Other">Other (specify below)</option>
              </select>

              <!-- Custom Category Input (shown when "Other" is selected) -->
              <input
                v-if="formData.category === 'Other'"
                v-model="formData.customCategory"
                type="text"
                maxlength="50"
                placeholder="Enter custom category"
                class="mt-3 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                :class="{ 'border-red-500': formErrors.customCategory }"
              />
              <p v-if="formErrors.category" class="mt-1 text-sm text-red-500">{{ formErrors.category }}</p>
              <p v-if="formErrors.customCategory" class="mt-1 text-sm text-red-500">{{ formErrors.customCategory }}</p>
            </div>

            <!-- Condition Field -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Condition <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  v-for="cond in conditionOptions"
                  :key="cond.value"
                  type="button"
                  @click="formData.condition = cond.value"
                  :class="[
                    'px-4 py-3 border rounded-lg text-sm font-medium transition duration-200',
                    formData.condition === cond.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  ]"
                >
                  {{ cond.label }}
                </button>
              </div>
              <p v-if="formErrors.condition" class="mt-1 text-sm text-red-500">{{ formErrors.condition }}</p>
            </div>

            <!-- Price Fields Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <!-- Original Price Field (Optional) -->
              <div>
                <label for="originalPrice" class="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (Optional)
                </label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="originalPrice"
                    v-model="formData.originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">What you originally paid for this item</p>
              </div>

              <!-- Selling Price Field (Required) -->
              <div>
                <label for="sellingPrice" class="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="sellingPrice"
                    v-model="formData.sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    :class="{ 'border-red-500': formErrors.sellingPrice }"
                  />
                </div>
                <p v-if="formErrors.sellingPrice" class="mt-1 text-sm text-red-500">{{ formErrors.sellingPrice }}</p>
              </div>
            </div>

            <!-- Item Description Field -->
            <div class="mb-6">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                About this Item <span class="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="5"
                maxlength="2000"
                placeholder="Describe your item in detail. Include dimensions, brand, features, any defects, etc."
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                :class="{ 'border-red-500': formErrors.description }"
              ></textarea>
              <p v-if="formErrors.description" class="mt-1 text-sm text-red-500">{{ formErrors.description }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ formData.description.length }}/2000 characters</p>
            </div>
          </div>

          <!-- Listing Details Section -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Listing Details</h3>

            <!-- Condition Details Field (Optional) -->
            <div class="mb-6">
              <label for="conditionDetails" class="block text-sm font-medium text-gray-700 mb-2">
                Condition Details (Optional)
              </label>
              <textarea
                id="conditionDetails"
                v-model="formData.conditionDetails"
                rows="3"
                maxlength="1000"
                placeholder="Any additional details about the condition, such as wear and tear, scratches, etc."
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">{{ formData.conditionDetails.length }}/1000 characters</p>
            </div>

            <!-- Expire Date Field -->
            <div class="mb-6">
              <label for="expireDate" class="block text-sm font-medium text-gray-700 mb-2">
                Listing Expiration Date <span class="text-red-500">*</span>
              </label>
              <input
                id="expireDate"
                v-model="formData.expireDate"
                type="date"
                :min="todayDate"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                :class="{ 'border-red-500': formErrors.expireDate }"
              />
              <p v-if="formErrors.expireDate" class="mt-1 text-sm text-red-500">{{ formErrors.expireDate }}</p>
              <p class="mt-1 text-sm text-gray-500">
                <span v-if="user?.move_out_date">
                  Your move-out date: {{ formatDate(user.move_out_date) }}
                </span>
                <span v-else>
                  Set when your listing should expire
                </span>
              </p>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end gap-4">
            <button
              @click="goBack"
              type="button"
              class="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Cancel
            </button>
            <button
              @click="submitListing"
              type="button"
              :disabled="isSubmitting"
              class="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="isSubmitting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? 'Posting...' : 'Post Listing' }}
            </button>
          </div>

          <!-- Submit Error Message -->
          <div v-if="submitError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-700">{{ submitError }}</p>
          </div>

          <!-- Submit Success Message -->
          <div v-if="submitSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-700">{{ submitSuccess }}</p>
          </div>
        </div>

        <!-- Right Column: Pricing Reference Panel (1/3 width on large screens) -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Pricing Reference</h3>
            <p class="text-sm text-gray-600 mb-4">
              See what similar items have sold for recently.
            </p>

            <!-- Condition for showing reference items -->
            <div v-if="!formData.category || !formData.condition" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="mt-4 text-gray-500">Select a category and condition to see similar sold items</p>
            </div>

            <!-- Loading State for Reference Items -->
            <div v-else-if="loadingPriceReference" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-4 text-gray-500">Loading price references...</p>
            </div>

            <!-- No Reference Items Found -->
            <div v-else-if="priceReferenceItems.length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="mt-4 text-gray-500">No similar items have been sold recently in this category</p>
            </div>

            <!-- Reference Items List -->
            <div v-else class="space-y-4">
              <div
                v-for="item in priceReferenceItems"
                :key="item.ItemID"
                class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition duration-200"
              >
                <!-- Item Image and Info -->
                <div class="flex gap-3">
                  <!-- Cover Image -->
                  <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      v-if="item.cover_image"
                      :src="item.cover_image"
                      :alt="item.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  <!-- Item Details -->
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-900 truncate text-sm">{{ item.title }}</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ item.category }}</span>
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{{ item.condition }}</span>
                    </div>
                  </div>
                </div>

                <!-- Price Info -->
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="text-xs text-gray-500">Original</p>
                      <p class="text-sm text-gray-600">
                        {{ item.original_price ? '$' + parseFloat(item.original_price).toFixed(2) : 'N/A' }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-gray-500">Sold For</p>
                      <p class="text-lg font-semibold text-green-600">${{ parseFloat(item.sold_price).toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Average Price Summary -->
              <div v-if="averageSoldPrice > 0" class="bg-blue-50 rounded-lg p-4 mt-4">
                <p class="text-sm text-blue-800">
                  <span class="font-semibold">Average sold price:</span>
                  ${{ averageSoldPrice.toFixed(2) }}
                </p>
                <p class="text-xs text-blue-600 mt-1">
                  Based on {{ priceReferenceItems.length }} similar item(s) sold recently
                </p>
              </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import listingService from '../services/listingService';

// Vue Router instance for navigation
const router = useRouter();

// Component state variables
const user = ref(null);
const showUserMenu = ref(false);

// Media upload reference and state
const mediaInput = ref(null);
const uploadedMedia = ref([]);
const mediaError = ref('');

// Form data state
const formData = ref({
  title: '',
  category: '',
  customCategory: '',
  condition: '',
  originalPrice: '',
  sellingPrice: '',
  description: '',
  conditionDetails: '',
  expireDate: ''
});

// Form validation errors
const formErrors = ref({
  title: '',
  category: '',
  customCategory: '',
  condition: '',
  sellingPrice: '',
  description: '',
  expireDate: ''
});

// Submission state
const isSubmitting = ref(false);
const submitError = ref('');
const submitSuccess = ref('');

// Pricing reference state
const loadingPriceReference = ref(false);
const priceReferenceItems = ref([]);

// Category and condition options
const categoryOptions = [
  'Furniture',
  'Electronics',
  'Kitchen',
  'Home Decor',
  'Clothing',
  'Books',
  'Sports',
  'Toys',
  'Office Supplies',
  'Automotive'
];

const conditionOptions = [
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

// Computed property: Get today's date in YYYY-MM-DD format for date input min value
const todayDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// Computed property: Calculate average sold price from reference items
const averageSoldPrice = computed(() => {
  if (priceReferenceItems.value.length === 0) return 0;
  const total = priceReferenceItems.value.reduce((sum, item) => sum + parseFloat(item.sold_price), 0);
  return total / priceReferenceItems.value.length;
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
      router.push('/orders');
      break;
    case 'postlisting':
      // Already on post listing page
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

// Function: Trigger file input click for media upload
const triggerMediaUpload = () => {
  mediaInput.value.click();
};

// Function: Handle media file upload from file input
const handleMediaUpload = (event) => {
  const files = Array.from(event.target.files);
  mediaError.value = '';

  // Check total file count limit (max 9)
  if (uploadedMedia.value.length + files.length > 9) {
    mediaError.value = 'You can upload a maximum of 9 files total.';
    return;
  }

  // Process each uploaded file
  for (const file of files) {
    // Determine if file is image or video based on MIME type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    // Validate file type
    if (!isImage && !isVideo) {
      mediaError.value = 'Invalid file type. Please upload images or videos only.';
      continue;
    }

    // Validate file size: 10MB for images, 50MB for videos
    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      mediaError.value = `File "${file.name}" exceeds the ${isImage ? '10MB' : '50MB'} size limit.`;
      continue;
    }

    // Check video count limit (max 1 video)
    if (isVideo && uploadedMedia.value.some(m => m.type === 'video')) {
      mediaError.value = 'You can only upload 1 video per listing.';
      continue;
    }

    // Create preview URL and add to uploaded media array
    const previewUrl = URL.createObjectURL(file);
    uploadedMedia.value.push({
      file: file,
      type: isImage ? 'image' : 'video',
      previewUrl: previewUrl
    });
  }

  // Reset file input to allow selecting the same file again if needed
  event.target.value = '';
};

// Function: Remove media item from uploaded list by index
const removeMedia = (index) => {
  // Revoke object URL to free memory
  URL.revokeObjectURL(uploadedMedia.value[index].previewUrl);
  // Remove item from array
  uploadedMedia.value.splice(index, 1);
};

// Function: Handle category change and fetch price reference data
const handleCategoryChange = () => {
  // Clear custom category if not selecting "Other"
  if (formData.value.category !== 'Other') {
    formData.value.customCategory = '';
  }
  // Fetch price reference if both category and condition are selected
  fetchPriceReference();
};

// Function: Fetch price reference items based on selected category and condition
const fetchPriceReference = async () => {
  // Only fetch if both category and condition are selected
  const category = formData.value.category === 'Other' ? formData.value.customCategory : formData.value.category;
  const condition = formData.value.condition;

  if (!category || !condition) {
    priceReferenceItems.value = [];
    return;
  }

  loadingPriceReference.value = true;

  try {
    const response = await listingService.getPriceReference(category, condition);
    if (response.success) {
      priceReferenceItems.value = response.data;
    } else {
      priceReferenceItems.value = [];
    }
  } catch (error) {
    console.error('Error fetching price reference:', error);
    priceReferenceItems.value = [];
  } finally {
    loadingPriceReference.value = false;
  }
};

// Function: Format date string for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Function: Validate form data before submission
const validateForm = () => {
  let isValid = true;

  // Reset all errors
  formErrors.value = {
    title: '',
    category: '',
    customCategory: '',
    condition: '',
    sellingPrice: '',
    description: '',
    expireDate: ''
  };

  // Validate title (required, min 5 characters)
  if (!formData.value.title.trim()) {
    formErrors.value.title = 'Title is required.';
    isValid = false;
  } else if (formData.value.title.trim().length < 5) {
    formErrors.value.title = 'Title must be at least 5 characters long.';
    isValid = false;
  }

  // Validate category (required)
  if (!formData.value.category) {
    formErrors.value.category = 'Please select a category.';
    isValid = false;
  }

  // Validate custom category if "Other" is selected
  if (formData.value.category === 'Other' && !formData.value.customCategory.trim()) {
    formErrors.value.customCategory = 'Please enter a custom category.';
    isValid = false;
  }

  // Validate condition (required)
  if (!formData.value.condition) {
    formErrors.value.condition = 'Please select a condition.';
    isValid = false;
  }

  // Validate selling price (required, must be greater than 0)
  if (!formData.value.sellingPrice || parseFloat(formData.value.sellingPrice) <= 0) {
    formErrors.value.sellingPrice = 'Please enter a valid selling price greater than $0.';
    isValid = false;
  }

  // Validate description (required, min 20 characters)
  if (!formData.value.description.trim()) {
    formErrors.value.description = 'Description is required.';
    isValid = false;
  } else if (formData.value.description.trim().length < 20) {
    formErrors.value.description = 'Description must be at least 20 characters long.';
    isValid = false;
  }

  // Validate expire date (required, must be today or future)
  if (!formData.value.expireDate) {
    formErrors.value.expireDate = 'Please select an expiration date.';
    isValid = false;
  } else if (new Date(formData.value.expireDate) < new Date(todayDate.value)) {
    formErrors.value.expireDate = 'Expiration date must be today or a future date.';
    isValid = false;
  }

  // Validate media (at least 1 image required)
  if (!uploadedMedia.value.some(m => m.type === 'image')) {
    mediaError.value = 'Please upload at least 1 photo.';
    isValid = false;
  }

  return isValid;
};

// Function: Submit listing form to backend
const submitListing = async () => {
  // Clear previous messages
  submitError.value = '';
  submitSuccess.value = '';

  // Validate form before submission
  if (!validateForm()) {
    submitError.value = 'Please fix the errors above before submitting.';
    return;
  }

  isSubmitting.value = true;

  try {
    // Create FormData object for multipart/form-data submission
    const formDataToSend = new FormData();

    // Append user ID from logged-in user
    formDataToSend.append('user_id', user.value.UID);

    // Append item fields
    formDataToSend.append('title', formData.value.title.trim());
    formDataToSend.append('category', formData.value.category === 'Other' ? formData.value.customCategory.trim() : formData.value.category);
    formDataToSend.append('condition', formData.value.condition);
    formDataToSend.append('description', formData.value.description.trim());
    formDataToSend.append('selling_price', formData.value.sellingPrice);

    // Append optional original price if provided
    if (formData.value.originalPrice) {
      formDataToSend.append('original_price', formData.value.originalPrice);
    }

    // Append listing fields
    formDataToSend.append('expire_date', formData.value.expireDate);
    if (formData.value.conditionDetails.trim()) {
      formDataToSend.append('condition_details', formData.value.conditionDetails.trim());
    }

    // Append media files in order (images first, then video)
    // Images are sorted to ensure first uploaded image becomes cover (slot 1)
    const images = uploadedMedia.value.filter(m => m.type === 'image');
    const videos = uploadedMedia.value.filter(m => m.type === 'video');

    images.forEach((media, index) => {
      formDataToSend.append('images', media.file);
    });

    videos.forEach((media) => {
      formDataToSend.append('video', media.file);
    });

    // Call listing service to create listing
    const response = await listingService.createListing(formDataToSend);

    if (response.success) {
      submitSuccess.value = 'Your listing has been posted successfully!';

      // Clear form after successful submission
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } else {
      submitError.value = response.message || 'Failed to post listing. Please try again.';
    }
  } catch (error) {
    console.error('Error submitting listing:', error);
    submitError.value = 'An unexpected error occurred. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

// Watch for condition changes to fetch price reference
watch(() => formData.value.condition, () => {
  fetchPriceReference();
});

// Watch for custom category changes to fetch price reference
watch(() => formData.value.customCategory, () => {
  if (formData.value.category === 'Other') {
    fetchPriceReference();
  }
});

// Lifecycle hook: Initialize component when mounted
onMounted(async () => {
  // Retrieve user data from browser local storage
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    user.value = JSON.parse(storedUser);

    // Set default expire date to user's move_out_date if available
    if (user.value.move_out_date) {
      // Format move_out_date to YYYY-MM-DD for date input
      const moveOutDate = new Date(user.value.move_out_date);
      if (moveOutDate >= new Date()) {
        formData.value.expireDate = moveOutDate.toISOString().split('T')[0];
      }
    }
  } else {
    // User is not logged in, redirect to login page
    router.push('/');
    return;
  }
});

// Cleanup: Revoke object URLs when component is unmounted
import { onUnmounted } from 'vue';
onUnmounted(() => {
  uploadedMedia.value.forEach(media => {
    URL.revokeObjectURL(media.previewUrl);
  });
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

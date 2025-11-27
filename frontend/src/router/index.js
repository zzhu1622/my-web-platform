// File: frontend/src/router/index.js
// Purpose: Defines all client-side routes for the AptExchange application
// Uses Vue Router for SPA (Single Page Application) navigation

import { createRouter, createWebHistory } from 'vue-router';

// =====================================================
// COMPONENT IMPORTS
// =====================================================

// Authentication Components
import ForgotPassword from '../components/auth/ForgotPassword.vue';
import ResetPassword from '../components/auth/ResetPassword.vue';
import LoginForm from '../components/auth/LoginForm.vue';

// Main Page Components
import Home from '../pages/Home.vue';
import Account from '../pages/Account.vue';
import Messages from '../pages/Messages.vue';
import PostListing from '../pages/PostListing.vue';
import Orders from '../pages/Orders.vue';

// Product Detail Component
// Displays complete product information with media gallery
import Detail from '../components/Detail.vue';

// Seller Profile Component (NEW)
// Displays seller's public profile (Overview tab) with return navigation
import SellerProfile from '../pages/SellerProfile.vue';

// =====================================================
// ROUTER CONFIGURATION
// =====================================================

// Create router instance with history mode
// createWebHistory uses regular URL history (no hash #)
const router = createRouter({
  // Configure history mode (uses HTML5 History API)
  history: createWebHistory(import.meta.env.BASE_URL || '/'),

  // Define all application routes
  routes: [
    // =====================================================
    // AUTHENTICATION ROUTES
    // =====================================================

    // Login Page Route
    // Entry point for unauthenticated users
    {
      path: '/login',
      name: 'Login',
      component: LoginForm,
      meta: {
        // This page is public (no authentication required)
        requiresAuth: false,
        // Page title for browser tab
        title: 'Login - AptExchange'
      }
    },

    // Forgot Password Route
    // Allows users to initiate password reset process
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPassword,
      meta: {
        requiresAuth: false,
        title: 'Forgot Password - AptExchange'
      }
    },

    // Reset Password Route
    // Handles password reset with email verification code
    // URL Parameter: email - User's email address for reset
    {
      path: '/reset-password/:email',
      name: 'ResetPassword',
      component: ResetPassword,
      meta: {
        requiresAuth: false,
        title: 'Reset Password - AptExchange'
      }
    },

    // =====================================================
    // MAIN APPLICATION ROUTES
    // =====================================================

    // Home Page Route
    // Displays all product listings with search and filter options
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
        // This page requires user to be logged in
        requiresAuth: true,
        title: 'Home - AptExchange'
      }
    },

    // Product Detail Route
    // Displays detailed information about a specific product listing
    // URL Parameter: listingId - The unique ID of the listing to display
    {
      path: '/listing/:listingId',
      name: 'ProductDetail',
      component: Detail,
      meta: {
        // Requires authentication to view product details
        requiresAuth: true,
        title: 'Product Details - AptExchange'
      }
    },

    // Seller Profile Route (NEW)
    // Displays a seller's public profile including ratings and reviews
    // Query Parameters:
    //   - sellerId: The UID of the seller to display
    //   - returnTo: The path to return to when user clicks back button
    {
      path: '/seller-profile',
      name: 'SellerProfile',
      component: SellerProfile,
      meta: {
        // Requires authentication to view seller profiles
        requiresAuth: true,
        title: 'Seller Profile - AptExchange'
      }
    },

    // Account Page Route
    // User's personal account management page
    // Includes: Overview, Personal Information, Listing Management tabs
    {
      path: '/account',
      name: 'Account',
      component: Account,
      meta: {
        requiresAuth: true,
        title: 'My Account - AptExchange'
      }
    },

    // Messages Page Route
    // Displays all user conversations with buyers and sellers
    {
      path: '/messages',
      name: 'Messages',
      component: Messages,
      meta: {
        requiresAuth: true,
        title: 'My Messages - AptExchange'
      }
    },

    // Orders Page Route
    // Displays purchase and sales orders for the user
    {
      path: '/orders',
      name: 'Orders',
      component: Orders,
      meta: {
        requiresAuth: true,
        title: 'My Orders - AptExchange'
      }
    },

    // Post Listing Route
    // Form for creating new product listings
    {
      path: '/post-listing',
      name: 'PostListing',
      component: PostListing,
      meta: {
        requiresAuth: true,
        title: 'Post Listing - AptExchange'
      }
    },

    // =====================================================
    // REDIRECT ROUTES
    // =====================================================

    // Root path redirect
    // All unauthenticated users redirected to login
    {
      path: '/',
      redirect: '/login'
    },

    // Wildcard route for undefined paths
    // Catches any URL that doesn't match defined routes
    // Redirects to login page
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
});

// =====================================================
// NAVIGATION GUARDS
// =====================================================

// Global navigation guard to check authentication status
// Runs before each route navigation
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Get user data from localStorage
  const user = localStorage.getItem('user');

  // Update document title based on route meta
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // If route requires authentication and user is not logged in
  if (requiresAuth && !user) {
    // Redirect to login page
    next('/login');
  } else if (!requiresAuth && user && to.path === '/login') {
    // If user is already logged in and tries to access login page
    // Redirect to home page
    next('/home');
  } else {
    // Allow navigation
    next();
  }
});

export default router;

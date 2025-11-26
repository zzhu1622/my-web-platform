import { createRouter, createWebHistory } from 'vue-router';

// ORIGINAL COMPONENT IMPORTS (maintained)
import ForgotPassword from '../components/auth/ForgotPassword.vue';
import ResetPassword from '../components/auth/ResetPassword.vue';
import LoginForm from '../components/auth/LoginForm.vue';
import Home from '../pages/Home.vue';
import Messages from '../pages/Messages.vue';

// ENHANCED COMPONENT IMPORTS (new for product detail page)
// This component displays complete product information with media gallery
import Detail from '../components/Detail.vue';

import Orders from '../pages/Orders.vue';

// Create router instance with history mode
// createWebHistory uses regular URL history (no hash #)
const router = createRouter({
  // Configure history mode (uses HTML5 History API)
  history: createWebHistory(import.meta.env.BASE_URL || '/'),

  // Define all application routes
  routes: [
    // ORIGINAL ROUTES (maintained - no changes)

    // Login Page Route
    // Existing login form component
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
    // Allows users to reset forgotten passwords
    {
      path: '/forgot-password',

      name: 'ForgotPassword',

      component: ForgotPassword,

      meta: {
        requiresAuth: false,

        // Page title for browser tab
        title: 'Forgot Password - AptExchange'
      }
    },

    // Reset Password Route
    // Handles password reset with email verification
    {
      path: '/reset-password/:email',

      // Component name for debugging
      name: 'ResetPassword',

      // Component to render for this route
      // Component handles password validation and reset
      component: ResetPassword,

      meta: {

        requiresAuth: false,

        // Page title for browser tab
        title: 'Reset Password - AptExchange'
      }
    },

    // Home Page Route
    // Displays all product listings
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

    // ENHANCED ROUTE (new for product detail page)
    // Displays detailed information about a specific product listing
    // Includes images/videos, pricing, seller info, and descriptions
    {
      path: '/listing/:listingId',

      // Component name for debugging and Vue DevTools
      name: 'ProductDetail',

      // Dynamic import for code splitting (loads only when needed)
      // This improves initial page load performance
      component: Detail,

      meta: {
        // This page requires user to be authenticated
        // Prevents unauthenticated users from viewing product details
        requiresAuth: true,

        // Page title for browser tab
        title: 'Product Details - AptExchange'
      }
    },

    // ORIGINAL ROUTES (maintained - no changes)

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
    },
    {
      path: '/messages',
      name: 'Messages',
      component: Messages,
      // Optional: Add route guard to ensure user is logged in
      beforeEnter: (to, from, next) => {
        const user = localStorage.getItem('user');
        if (user) {
          next();
        } else {
          next('/');
        }
      }
    },

    {
      path: '/orders',
      name: 'Orders',
      component: Orders,
      meta: {
        requiresAuth: true,
        title: 'My Orders - AptExchange'
      }
    }
  ]
});

// Check authentication requirements and set page titles
// ORIGINAL NAVIGATION GUARD (maintained with enhanced comments)
router.beforeEach((to, from, next) => {
  // Check if user is logged in by reading localStorage flag
  // This flag is set during successful login and cleared on logout
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Check if target route requires authentication
  // Routes can specify requiresAuth in their meta property
  const requiresAuth = to.meta.requiresAuth;

  // Set page title from route meta
  // Updates browser tab title to match current page
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // Authentication check logic
  // ORIGINAL LOGIC (maintained)
  if (requiresAuth && !isLoggedIn) {
    // User trying to access protected route without login
    // Redirect to login page
    next('/login');
  } else if (!requiresAuth && isLoggedIn && (to.path === '/login' || to.path === '/forgot-password')) {
    // Logged-in user trying to access public pages (login/forgot-password)
    // Redirect to home page
    next('/home');
  } else {
    // All other cases: allow navigation
    next();
  }
});

// ORIGINAL AFTER-NAVIGATION HOOK (maintained)
// Scroll to top of page after navigation completes
// This prevents user from being scrolled to middle of previous page
router.afterEach((to, from) => {
  window.scrollTo(0, 0);
});

export default router;

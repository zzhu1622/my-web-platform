import { createRouter, createWebHistory } from 'vue-router';

import ForgotPassword from '../components/auth/ForgotPassword.vue';
import ResetPassword from '../components/auth/ResetPassword.vue';

import LoginForm from '../components/auth/LoginForm.vue';

import Home from '../pages/Home.vue';

// Create router instance with history mode
// createWebHistory uses regular URL history (no hash #)
const router = createRouter({
  // Configure history mode (uses HTML5 History API)
  history: createWebHistory(import.meta.env.BASE_URL || '/'),

  // Define all application routes
  routes: [
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

    {
      path: '/',
      redirect: '/login'
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
});

// Check authentication requirements and set page titles
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Check if target route requires authentication
  const requiresAuth = to.meta.requiresAuth;

  // Set page title from route meta
  // Updates browser tab title
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // Authentication check logic
  if (requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (!requiresAuth && isLoggedIn && (to.path === '/login' || to.path === '/forgot-password')) {
    next('/home');
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  window.scrollTo(0, 0);
});


export default router;

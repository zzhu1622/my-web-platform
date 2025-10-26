import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/auth/LoginForm.vue';
import Home from '../pages/Home.vue';

const routes = [
  // Login route: Default route when accessing root path
  {
    path: '/',
    name: 'Login',
    component: LoginForm
  },

  // Home route: Accessible after successful login
  {
    path: '/home',
    name: 'Home',
    component: Home,
    // Optional: Add meta field for route protection
    meta: { requiresAuth: true }
  }
];

// Create router instance with history mode
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Optional: Add navigation guard to protect routes that require authentication
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (requiresAuth && !isLoggedIn) {
    // Redirect to login if trying to access protected route without login
    next('/');
  } else {
    next();
  }
});

export default router;

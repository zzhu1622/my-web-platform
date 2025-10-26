<template>
  <div id="app">
    <!-- Show login if not logged in -->
    <LoginForm v-if="!isLoggedIn" />

    <!-- Show dashboard if logged in (placeholder for now) -->
    <div v-else class="dashboard">
      <div class="dashboard-header">
        <h1>Welcome, {{ userName }}!</h1>
        <button @click="handleLogout" class="logout-button">Logout</button>
      </div>
      <div class="dashboard-content">
        <p>You are successfully logged in.</p>
        <p>Dashboard and other features coming soon...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import LoginForm from './components/auth/LoginForm.vue';
import authService from './services/authService';

export default {
  name: 'App',
  components: {
    LoginForm
  },
  setup() {
    const isLoggedIn = ref(false);
    const userName = ref('');

    onMounted(() => {
      // Check if user is already logged in
      if (authService.isLoggedIn()) {
        isLoggedIn.value = true;
        const user = authService.getCurrentUser();
        userName.value = user?.name || 'User';
      }
    });

    const handleLogout = () => {
      authService.logout();
      isLoggedIn.value = false;
      userName.value = '';
    };

    return {
      isLoggedIn,
      userName,
      handleLogout
    };
  }
};
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: rgba(0, 0, 0, 0.1);
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.dashboard-header h1 {
  font-size: 24px;
  margin: 0;
}

.logout-button {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

.dashboard-content p {
  font-size: 18px;
  margin: 10px 0;
}
</style>

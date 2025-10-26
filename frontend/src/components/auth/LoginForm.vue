<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">Trading Platform</h1>
      <p class="login-subtitle">Second-Hand Marketplace</p>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin">
        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success">
          <span class="alert-icon">✓</span>
          {{ successMessage }}
        </div>

        <!-- Identifier Input (Email or UID) -->
        <div class="form-group">
          <label for="identifier">Email or UID</label>
          <input
            id="identifier"
            v-model="identifier"
            type="text"
            placeholder="Enter your email or UID"
            class="form-input"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="form-input"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          class="login-button"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Login</span>
          <span v-else>Logging in...</span>
        </button>
      </form>

      <!-- Info Message -->
      <div class="info-box">
        <p><strong>Test Credentials:</strong></p>
        <p>Email: alice.johnson@email.com</p>
        <p>Password: password123</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import authService from '../../services/authService';

export default {
  name: 'LoginForm',
  setup() {
    const identifier = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    const handleLogin = async () => {
      // Reset messages
      errorMessage.value = '';
      successMessage.value = '';

      // Validate input
      if (!identifier.value.trim() || !password.value.trim()) {
        errorMessage.value = 'Please enter both email/UID and password';
        return;
      }

      isLoading.value = true;

      try {
        // Call login service
        const response = await authService.login(identifier.value, password.value);

        if (response.success) {
          successMessage.value = response.message;

          // Store user info in localStorage
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('isLoggedIn', 'true');

          // Clear form
          identifier.value = '';
          password.value = '';

          // Redirect after 1.5 seconds
          setTimeout(() => {
            // For now, just show success
            // Later: this.$router.push('/dashboard');
            console.log('User logged in:', response.user);
          }, 1500);
        } else {
          errorMessage.value = response.message;
        }
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.value = error.message || 'An error occurred during login';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      identifier,
      password,
      errorMessage,
      successMessage,
      isLoading,
      handleLogin
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  text-align: center;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
}

/* Alert Styles */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-size: 14px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-error {
  background-color: #fee;
  color: #c33;
  border-left: 4px solid #c33;
}

.alert-success {
  background-color: #efe;
  color: #3c3;
  border-left: 4px solid #3c3;
}

.alert-icon {
  margin-right: 10px;
  font-weight: bold;
}

/* Form Styles */
form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input {
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-input::placeholder {
  color: #999;
}

/* Button Styles */
.login-button {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Info Box */
.info-box {
  margin-top: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  border-left: 4px solid #667eea;
}

.info-box p {
  margin: 5px 0;
}

.info-box strong {
  color: #333;
  display: block;
  margin-bottom: 8px;
}

/* Responsive */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-container {
    padding: 20px;
  }
}
</style>

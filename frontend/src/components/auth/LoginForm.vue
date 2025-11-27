<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">AptExchange</h1>
      <p class="login-subtitle">Marketplace for residents living</p>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin">
        <!-- Error Message Alert -->
        <div v-if="errorMessage" class="alert alert-error">
          <span class="alert-icon">Error:</span>
          {{ errorMessage }}
        </div>

        <!-- Success Message Alert -->
        <div v-if="successMessage" class="alert alert-success">
          <span class="alert-icon">Success:</span>
          {{ successMessage }}
        </div>

        <!-- Identifier Input: Email or UID -->
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

          <!-- Forgot Password Link -->
          <!-- This link navigates to the forgot password page -->
          <!-- Styled as blue link with hover effect -->
          <!-- User clicks this to initiate password reset process -->
          <div class="forgot-password-section">
            <router-link to="/forgot-password" class="forgot-password-link">
              Forgot your password?
            </router-link>
          </div>
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

      <!-- Test Credentials Information Box -->
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
import { useRouter } from 'vue-router';
import authService from '../../services/authService';

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter();

    // Reactive data properties for form
    const identifier = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    // Handle login form submission
    // Validates input, calls auth service, handles response
    const handleLogin = async () => {
      // Clear previous messages before new attempt
      errorMessage.value = '';
      successMessage.value = '';

      // Validate both fields have content
      // Trim whitespace to ignore spaces
      if (!identifier.value.trim() || !password.value.trim()) {
        errorMessage.value = 'Please enter both email/UID and password';
        return;
      }

      // Set loading state to disable button and show loading text
      isLoading.value = true;

      try {
        // Call authentication service with provided credentials
        const response = await authService.login(identifier.value, password.value);

        // Check if login was successful
        if (response.success) {
          // Store user information in browser's local storage
          // This allows user to remain logged in across page refreshes
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('isLoggedIn', 'true');

          // Show success message briefly
          successMessage.value = response.message;

          // Clear form fields
          identifier.value = '';
          password.value = '';

          // Wait 1 second then navigate to home page
          // Gives user time to see success message
          setTimeout(() => {
            router.push('/home');
          }, 1000);
        } else {
          // Login failed - display error message from service
          errorMessage.value = response.message;
        }
      } catch (error) {
        // Handle unexpected errors during login
        console.error('Login error:', error);
        errorMessage.value = error.message || 'An error occurred during login';
      } finally {
        // Always clear loading state, even if error occurred
        // This re-enables the button
        isLoading.value = false;
      }
    };

    // Return all reactive properties and methods for template
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
/* CSS Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Main Login Container */
/* Full viewport height with gradient background */
/* Flexbox centers login box both horizontally and vertically */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Login Box Container */
/* White card with shadow and animation */
/* Max-width ensures readability on large screens */
.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.5s ease-out;
}

/* Slide up animation on component mount */
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

/* Login Title Styling */
.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #155dfc;
  margin-bottom: 5px;
  text-align: center;
}

/* Login Subtitle Styling */
.login-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
}

/* =====================================================
   ALERT STYLES
   ===================================================== */

/* Alert Base Styles */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-size: 14px;
  animation: slideDown 0.3s ease-out;
}

/* Slide down animation for alerts */
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

/* Error Alert Styling */
.alert-error {
  background-color: #fee;
  color: #c33;
  border-left: 4px solid #c33;
}

/* Success Alert Styling */
.alert-success {
  background-color: #efe;
  color: #3c3;
  border-left: 4px solid #3c3;
}

/* Alert Icon Styling */
.alert-icon {
  margin-right: 10px;
  font-weight: bold;
}

/* =====================================================
   FORM STYLES
   ===================================================== */

/* Form Container */
form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form Group: Wraps label and input */
.form-group {
  display: flex;
  flex-direction: column;
}

/* Form Labels */
label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

/* Form Inputs */
.form-input {
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

/* Input Focus State */
.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Input Disabled State */
.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Input Placeholder Text */
.form-input::placeholder {
  color: #999;
}

/* =====================================================
   FORGOT PASSWORD SECTION
   ===================================================== */

/* Container for forgot password link */
/* Positioned below password input */
/* Small top margin for spacing */
.forgot-password-section {
  margin-top: 8px;
  text-align: right;
}

/* Forgot Password Link Styling */
/* Styled as blue link with hover effects */
/* No underline by default, shows on hover */
/* Matches router-link styling */
.forgot-password-link {
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Forgot Password Link Hover State */
.forgot-password-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Forgot Password Link Active/Visited State */
.forgot-password-link:visited {
  color: #667eea;
}

/* =====================================================
   BUTTON STYLES
   ===================================================== */

/* Login Button */
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

/* Button Hover State */
.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

/* Button Active/Pressed State */
.login-button:active:not(:disabled) {
  transform: translateY(0);
}

/* Button Disabled State */
.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* =====================================================
   INFO BOX STYLES
   ===================================================== */

/* Info Box Container */
.info-box {
  margin-top: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  border-left: 4px solid #667eea;
}

/* Info Box Paragraphs */
.info-box p {
  margin: 5px 0;
}

/* Info Box Strong Text */
.info-box strong {
  color: #333;
  display: block;
  margin-bottom: 8px;
}

/* =====================================================
   RESPONSIVE DESIGN
   ===================================================== */

/* Mobile Devices (max 480px width) */
@media (max-width: 480px) {
  /* Reduce padding on mobile for smaller screens */
  .login-box {
    padding: 30px 20px;
  }

  /* Smaller title on mobile */
  .login-title {
    font-size: 24px;
  }

  /* Add padding to container on mobile */
  .login-container {
    padding: 20px;
  }
}
</style>

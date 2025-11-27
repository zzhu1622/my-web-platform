<template>
  <!-- Main Page Container -->
  <!-- Uses CSS Grid to create two-column layout: 2/3 for background, 1/3 for login form -->
  <div class="login-page">
    <!-- Left Section: Background Image Area -->
    <!-- Occupies left 2/3 of the viewport width -->
    <!-- Contains the decorative background image anchored to bottom -->
    <div class="background-section">
      <!-- Background image is applied via CSS background-image property -->
      <!-- The image is centered horizontally and anchored to the bottom -->
    </div>

    <!-- Right Section: Login Form Area -->
    <!-- Occupies right 1/3 of the viewport width -->
    <!-- Contains the login box positioned in the upper portion -->
    <div class="login-section">
      <!-- Login Form Container -->
      <!-- Positioned in upper-right area, centered within the right 1/3 column -->
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
/* =====================================================
   CSS RESET AND BASE STYLES
   ===================================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* =====================================================
   MAIN PAGE LAYOUT
   Uses CSS Grid to create a two-column layout:
   - Left column (2/3 width): Background image area
   - Right column (1/3 width): Login form area
   ===================================================== */

.login-page {
  display: grid;
  /* Two columns: left takes 2fr (2/3), right takes 1fr (1/3) */
  grid-template-columns: 2fr 1fr;
  min-height: 100vh;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* =====================================================
   LEFT SECTION: BACKGROUND IMAGE AREA
   - Occupies left 2/3 of the page
   - Background image anchored to bottom
   - Image centered horizontally within this section
   - Fallback solid color for uncovered areas
   ===================================================== */

.background-section {
  /* Fallback background color when image does not cover entire area */
  /* This color fills any space not covered by the image */
  background-color: #f0f4f8;

  /* Background image configuration */
  /* Path uses the API route to fetch image from backend */
  /* The imageController serves files from Database/Background directory */
  /* Full URL: http://localhost:3000/api/images/background/Login-BG.jpg */
  background-image: url('http://localhost:3000/api/images/background/Login-BG.jpg');

  /* Prevent the image from repeating (tiling) */
  background-repeat: no-repeat;

  /* Position the image: centered horizontally, anchored to bottom */
  /* 'center' aligns the image horizontally in the middle of the container */
  /* 'bottom' anchors the image to the bottom edge of the viewport */
  background-position: center bottom;

  /* Image sizing: cover fills the entire area while maintaining aspect ratio */
  /* Some parts of the image may be cropped if aspect ratios differ */
  background-size: cover;

  /* Ensure the section fills the full height of the viewport */
  min-height: 100vh;

  /* Position relative for any potential overlay elements */
  position: relative;
}

/* =====================================================
   RIGHT SECTION: LOGIN FORM AREA
   - Occupies right 1/3 of the page
   - Contains the login box
   - Login box positioned in upper portion, centered horizontally
   ===================================================== */

.login-section {
  /* Flexbox layout to position the login box */
  display: flex;

  /* Center the login box horizontally within this 1/3 column */
  justify-content: center;

  /* Center the login box vertically in the middle of the section */
  /* Using 'center' places content at the vertical middle */
  align-items: center;

  /* Add horizontal padding for smaller screens */
  padding-left: 30px;
  padding-right: 30px;

  /* Full viewport height to ensure proper vertical centering */
  min-height: 100vh;

  /* Background color for the login section */
  /* Provides visual separation from the image section */
  background-color: #ffffff;
}

/* =====================================================
   LOGIN BOX CONTAINER
   - White card with shadow and animation
   - Centered within the right 1/3 column
   - Fixed width for consistent appearance
   ===================================================== */

.login-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  /* Increased padding for larger form appearance */
  padding: 50px;
  width: 100%;
  /* Increased max-width for larger form */
  max-width: 450px;
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

/* =====================================================
   LOGIN TITLE AND SUBTITLE
   ===================================================== */

.login-title {
  /* Increased font size for larger appearance */
  font-size: 36px;
  font-weight: bold;
  color: #155dfc;
  margin-bottom: 8px;
  text-align: center;
}

.login-subtitle {
  /* Increased font size for larger appearance */
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 35px;
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
  /* Increased gap between form elements */
  gap: 24px;
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
  margin-bottom: 10px;
  /* Increased font size for labels */
  font-size: 16px;
}

/* Form Inputs */
.form-input {
  /* Increased padding for larger input fields */
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  /* Increased font size for input text */
  font-size: 16px;
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
  /* Increased font size for better visibility */
  font-size: 14px;
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
  /* Increased padding for larger button */
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  /* Increased font size for button text */
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
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

/* Tablet and smaller screens (max 1024px width) */
/* Stack the layout vertically when screen is too narrow */
@media (max-width: 1024px) {
  .login-page {
    /* Change to single column layout on smaller screens */
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .background-section {
    /* Reduce height of background section on smaller screens */
    min-height: 30vh;
    /* Hide background on very small screens to prioritize login form */
    display: block;
  }

  .login-section {
    /* Center the login box vertically on smaller screens */
    align-items: center;
    padding-top: 40px;
    padding-bottom: 40px;
    min-height: auto;
    /* Add subtle background gradient for visual appeal */
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  }
}

/* Mobile Devices (max 768px width) */
@media (max-width: 768px) {
  .background-section {
    /* Further reduce background height on mobile */
    min-height: 25vh;
  }

  .login-section {
    padding-top: 30px;
    padding-left: 15px;
    padding-right: 15px;
  }

  .login-box {
    padding: 30px 25px;
    max-width: 100%;
  }
}

/* Small Mobile Devices (max 480px width) */
@media (max-width: 480px) {
  .background-section {
    /* Minimal background on very small screens */
    min-height: 20vh;
  }

  .login-box {
    padding: 25px 20px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-subtitle {
    font-size: 13px;
    margin-bottom: 25px;
  }
}
</style>

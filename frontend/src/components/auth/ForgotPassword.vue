<template>
  <div class="forgot-password-container">
    <div class="forgot-password-box">
      <!-- Header Section -->
      <div class="header">
        <h1 class="title">Reset Password</h1>
        <p class="subtitle">Enter your email to receive a verification code</p>
      </div>

      <!-- Email Verification Form -->
      <!-- This form collects email and sends verification code -->
      <form @submit.prevent="handleSendCode" class="form-section">
        <!-- Error Alert Message -->
        <!-- Displays validation or server errors -->
        <div v-if="errorMessage" class="alert alert-error">
          <span class="alert-icon">Error:</span>
          {{ errorMessage }}
        </div>

        <!-- Success Alert Message -->
        <!-- Displays success confirmation message -->
        <div v-if="successMessage" class="alert alert-success">
          <span class="alert-icon">Success:</span>
          {{ successMessage }}
        </div>

        <!-- Email Input Field -->
        <!-- User enters email address to initiate password reset -->
        <!-- Real-time validation provides immediate feedback -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-container">
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your registered email"
              class="form-input"
              required
              :disabled="isLoading || isCountdownActive"
              @blur="validateEmail"
            />
            <!-- Email validation indicator -->
            <!-- Shows validation status immediately -->
            <div v-if="emailValidated" :class="['email-validation', emailExists ? 'email-valid' : 'email-invalid']">
              <span v-if="emailExists" class="validation-text">Email found</span>
              <span v-else class="validation-text">Email not found</span>
            </div>
          </div>
          <!-- Real-time validation feedback -->
          <!-- Helps user correct errors before submission -->
          <div v-if="emailValidationError" class="error-text">
            {{ emailValidationError }}
          </div>
        </div>

        <!-- Send Verification Code Button -->
        <!-- Text changes based on state: Send Verification Code or Send New Verification Code -->
        <!-- Button is disabled during 60-second countdown and while loading -->
        <!-- Countdown timer prevents rapid repeated requests (rate limiting) -->
        <div class="button-section">
          <button
            type="submit"
            class="send-button"
            :disabled="isLoading || isCountdownActive || !emailExists"
          >
            <span v-if="!isLoading && !isCountdownActive && !codeSent">
              Send Verification Code
            </span>
            <span v-else-if="isLoading">
              Sending...
            </span>
            <span v-else-if="isCountdownActive">
              Send New Verification Code ({{ countdownSeconds }}s)
            </span>
            <span v-else>
              Code Sent
            </span>
          </button>
        </div>

        <!-- Information Text -->
        <!-- Explains what happens when code is sent -->
        <div v-if="codeSent" class="info-text">
          A verification code has been sent to {{ email }}. It will expire in 15 minutes.
        </div>

        <!-- Countdown Timer Display -->
        <!-- Shows remaining seconds before user can resend code -->
        <!-- Implements rate limiting to prevent spam -->
        <div v-if="isCountdownActive && codeSent" class="countdown-info">
          You can send a new verification code in {{ countdownSeconds }} seconds.
        </div>
      </form>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Verification Code Section -->
      <!-- Only shows after initial code is sent -->
      <!-- User enters 6-digit code received in email -->
      <form v-if="codeSent" @submit.prevent="handleVerifyCode" class="form-section">
        <!-- Verification Code Input -->
        <!-- 6-digit code from email -->
        <!-- Real-time validation ensures proper format -->
        <div class="form-group">
          <label for="code">Verification Code</label>
          <input
            id="code"
            v-model="verificationCode"
            type="text"
            placeholder="Enter 6-digit code"
            maxlength="6"
            class="form-input code-input"
            required
            :disabled="isVerifying || codeVerified"
            @input="formatCodeInput"
          />
          <div v-if="codeFormatError" class="error-text">
            {{ codeFormatError }}
          </div>
          <div v-if="codeAttempts && !codeVerified" class="attempts-text">
            Attempts remaining: {{ 6 - codeAttempts }}
          </div>
        </div>

        <!-- Verify Code Button -->
        <!-- Validates code against what was sent -->
        <!-- Shows loading state while verification is in progress -->
        <button
          type="submit"
          class="verify-button"
          :disabled="isVerifying || codeVerified || verificationCode.length < 6"
        >
          <span v-if="!isVerifying && !codeVerified">Verify Code</span>
          <span v-else-if="isVerifying">Verifying...</span>
          <span v-else>Code Verified</span>
        </button>

        <!-- Error Message for Code Verification -->
        <!-- Shows specific error if code is invalid -->
        <!-- Displays remaining attempts before code is locked -->
        <div v-if="codeErrorMessage" class="alert alert-error">
          <span class="alert-icon">Error:</span>
          {{ codeErrorMessage }}
        </div>
      </form>

      <!-- Back to Login Link -->
      <!-- Always visible, allows user to return to login -->
      <!-- Positioned at bottom of form -->
      <div class="back-to-login">
        <router-link to="/login" class="back-link">
          Back to Login
        </router-link>
      </div>

      <!-- Navigation to Password Reset Page -->
      <!-- Automatically navigates when code is verified -->
      <!-- Passes email through route params -->
      <!-- User proceeds to create new password -->
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import passwordResetService from '../../services/passwordResetService';

export default {
  name: 'ForgotPassword',
  setup() {
    const router = useRouter();

    // =====================================================
    // REACTIVE DATA PROPERTIES
    // =====================================================

    // Email input value
    const email = ref('');

    // Flag for email validation status
    const emailValidated = ref(false);

    // Result of email validation check
    const emailExists = ref(false);

    // Error message for email validation
    const emailValidationError = ref('');

    // Verification code input value
    const verificationCode = ref('');

    // General error message
    const errorMessage = ref('');

    // Success message for code sent
    const successMessage = ref('');

    // Error message for code verification
    const codeErrorMessage = ref('');

    // Error message for code format
    const codeFormatError = ref('');

    // Loading state for sending code request
    const isLoading = ref(false);

    // Loading state for verifying code
    const isVerifying = ref(false);

    // Flag indicating code has been sent
    const codeSent = ref(false);

    // Flag indicating code has been verified
    const codeVerified = ref(false);

    // 60-second countdown after sending code
    const countdownSeconds = ref(60);

    // Flag indicating countdown is active
    const isCountdownActive = ref(false);

    // Number of failed code verification attempts
    const codeAttempts = ref(0);

    // =====================================================
    // COMPUTED PROPERTIES
    // =====================================================

    // Countdown timer reference
    let countdownInterval = null;

    // =====================================================
    // METHODS
    // =====================================================

    // Validate email format and existence
    // Called when user leaves email input field
    // Checks email format and verifies it exists in database
    const validateEmail = async () => {
      // Reset validation state
      emailValidated.value = false;
      emailValidationError.value = '';
      errorMessage.value = '';

      // Get email value and trim whitespace
      const emailValue = email.value.trim();

      // If email field is empty, clear validation
      if (!emailValue) {
        return;
      }

      // Basic email format validation using regex
      // Pattern matches: something@domain.something
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // If email doesn't match format, show error
      if (!emailRegex.test(emailValue)) {
        emailValidationError.value = 'Please enter a valid email address';
        return;
      }

      try {
        // Call backend to verify email exists
        // Returns true if email is registered, false otherwise
        const response = await passwordResetService.verifyEmail(emailValue);

        // Set validation result
        emailValidated.value = true;
        emailExists.value = response.emailExists;

        // If email not found, show appropriate message
        if (!response.emailExists) {
          emailValidationError.value = 'Email not found in our records';
        }

      } catch (error) {
        // Handle validation errors
        console.error('Email validation error:', error);
        emailValidationError.value = 'Error validating email. Please try again.';
      }
    };

    // Send verification code to user's email
    // Called when user clicks "Send Verification Code" button
    const handleSendCode = async () => {
      // Reset error messages
      errorMessage.value = '';
      codeErrorMessage.value = '';

      // Get email value
      const emailValue = email.value.trim();

      // Validate email is provided and valid
      if (!emailValue) {
        errorMessage.value = 'Please enter an email address';
        return;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        errorMessage.value = 'Please enter a valid email address';
        return;
      }

      // Set loading state
      isLoading.value = true;

      try {
        // Call backend to send verification code
        // Backend generates code, saves to database, sends email
        const response = await passwordResetService.forgotPassword(emailValue);

        // Check if code was sent successfully
        if (response.success) {
          // Show success message
          successMessage.value = response.message;

          // Show code input section
          codeSent.value = true;

          // Start 60-second countdown
          startCountdown();

          // Clear error messages
          errorMessage.value = '';

        } else {
          // Show error from server
          errorMessage.value = response.message;
        }

      } catch (error) {
        // Handle unexpected errors
        console.error('Send code error:', error);
        errorMessage.value = error.message || 'Failed to send verification code. Please try again.';

      } finally {
        // Clear loading state
        isLoading.value = false;
      }
    };

    // Format code input to show only digits
    // Called on every character input to ensure 6 digits only
    const formatCodeInput = () => {
      // Remove any non-digit characters
      verificationCode.value = verificationCode.value.replace(/\D/g, '');

      // Clear format error if input is valid
      if (verificationCode.value.length === 6) {
        codeFormatError.value = '';
      }
    };

    // Verify the 6-digit code provided by user
    // Called when user clicks "Verify Code" button
    const handleVerifyCode = async () => {
      // Reset error messages
      codeErrorMessage.value = '';
      errorMessage.value = '';

      // Validate code format
      if (verificationCode.value.length !== 6) {
        codeFormatError.value = 'Verification code must be 6 digits';
        return;
      }

      // Set loading state
      isVerifying.value = true;

      try {
        // Call backend to verify code
        // Backend checks: exists, not expired, not used, attempts < 6
        const response = await passwordResetService.verifyCode(
          email.value.trim(),
          verificationCode.value
        );

        // Check if code verified successfully
        if (response.success) {
          // Mark code as verified
          codeVerified.value = true;

          // Store verified email for next step (password reset)
          sessionStorage.setItem('resetEmail', email.value.trim());
          sessionStorage.setItem('resetCode', verificationCode.value);

          // Show success message
          successMessage.value = 'Code verified successfully! Redirecting...';

          // Wait 1 second then navigate to password reset page
          setTimeout(() => {
            router.push({
              name: 'ResetPassword',
              params: { email: email.value.trim() }
            });
          }, 1000);

        } else {
          // Code verification failed
          codeErrorMessage.value = response.message;

          // Update attempt counter if provided
          if (response.attemptsRemaining !== undefined) {
            codeAttempts.value = 6 - response.attemptsRemaining;
          }
        }

      } catch (error) {
        // Handle unexpected errors
        console.error('Verify code error:', error);
        codeErrorMessage.value = error.message || 'Error verifying code. Please try again.';

      } finally {
        // Clear loading state
        isVerifying.value = false;
      }
    };

    // Start 60-second countdown timer
    // Prevents user from sending code again too quickly
    // Implements rate limiting and prevents spam
    const startCountdown = () => {
      // Set countdown as active
      isCountdownActive.value = true;

      // Reset countdown to 60 seconds
      countdownSeconds.value = 60;

      // Clear any existing countdown interval
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      // Create new countdown interval
      // Decrements every second
      countdownInterval = setInterval(() => {
        countdownSeconds.value--;

        // When countdown reaches 0, stop the interval
        if (countdownSeconds.value <= 0) {
          clearInterval(countdownInterval);
          isCountdownActive.value = false;
          countdownSeconds.value = 60;
        }
      }, 1000);
    };

    // Cleanup on component unmount
    // Prevents memory leaks from interval
    const cleanup = () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };

    // Component mounted lifecycle hook
    // Called when component is initialized
    onMounted(() => {
      // Component initialization if needed
    });

    // Return all reactive properties and methods
    return {
      email,
      emailValidated,
      emailExists,
      emailValidationError,
      verificationCode,
      errorMessage,
      successMessage,
      codeErrorMessage,
      codeFormatError,
      isLoading,
      isVerifying,
      codeSent,
      codeVerified,
      countdownSeconds,
      isCountdownActive,
      codeAttempts,
      validateEmail,
      handleSendCode,
      formatCodeInput,
      handleVerifyCode,
      startCountdown,
      cleanup
    };
  },

  // Cleanup on component destroy
  beforeUnmount() {
    this.cleanup();
  }
};
</script>

<style scoped>
/* =====================================================
   MAIN CONTAINER STYLES
   ===================================================== */

.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  padding: 20px;
}

.forgot-password-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 450px;
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

/* =====================================================
   HEADER SECTION
   ===================================================== */

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

/* =====================================================
   ALERT STYLES
   ===================================================== */

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

/* =====================================================
   FORM STYLES
   ===================================================== */

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  width: 100%;
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

/* Code input specific styling */
.code-input {
  font-size: 18px;
  letter-spacing: 8px;
  text-align: center;
  font-weight: bold;
}

/* =====================================================
   EMAIL VALIDATION INDICATOR
   ===================================================== */

.email-validation {
  position: absolute;
  right: 12px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.email-valid {
  color: #3c3;
  background-color: #efe;
}

.email-invalid {
  color: #c33;
  background-color: #fee;
}

.validation-text {
  display: block;
}

/* =====================================================
   ERROR AND INFO TEXT STYLES
   ===================================================== */

.error-text {
  font-size: 12px;
  color: #c33;
  margin-top: 4px;
}

.info-text {
  font-size: 13px;
  color: #666;
  background-color: #f0f0f0;
  padding: 10px 12px;
  border-radius: 6px;
  text-align: center;
  margin-top: 10px;
}

.countdown-info {
  font-size: 13px;
  color: #667eea;
  text-align: center;
  padding: 8px 12px;
  background-color: #f0f4ff;
  border-radius: 6px;
  margin-top: 10px;
}

.attempts-text {
  font-size: 12px;
  color: #ff6b6b;
  margin-top: 4px;
}

/* =====================================================
   BUTTON STYLES
   ===================================================== */

.button-section {
  display: flex;
  gap: 10px;
}

.send-button,
.verify-button {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.send-button:hover:not(:disabled),
.verify-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.send-button:active:not(:disabled),
.verify-button:active:not(:disabled) {
  transform: translateY(0);
}

.send-button:disabled,
.verify-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* =====================================================
   DIVIDER
   ===================================================== */

.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 20px 0;
}

/* =====================================================
   BACK TO LOGIN LINK
   ===================================================== */

.back-to-login {
  text-align: center;
  margin-top: 20px;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* =====================================================
   RESPONSIVE DESIGN
   ===================================================== */

@media (max-width: 480px) {
  .forgot-password-box {
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 13px;
  }
}
</style>

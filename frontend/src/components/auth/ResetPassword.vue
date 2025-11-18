<template>
  <div class="reset-password-container">
    <div class="reset-password-box">
      <!-- Header Section -->
      <div class="header">
        <h1 class="title">Create New Password</h1>
        <p class="subtitle">Your verification code has been confirmed. Please enter your new password.</p>
      </div>

      <!-- Reset Password Form -->
      <!-- Collects new password and confirms it matches -->
      <form @submit.prevent="handleResetPassword" class="form-section">
        <!-- Error Alert Message -->
        <div v-if="errorMessage" class="alert alert-error">
          <span class="alert-icon">Error:</span>
          {{ errorMessage }}
        </div>

        <!-- Success Alert Message -->
        <div v-if="successMessage" class="alert alert-success">
          <span class="alert-icon">Success:</span>
          {{ successMessage }}
        </div>

        <!-- New Password Field -->
        <!-- User enters desired new password -->
        <!-- Password must meet security requirements -->
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            placeholder="Enter new password"
            class="form-input"
            required
            :disabled="isLoading"
            @input="validatePassword"
          />
          <!-- Password Strength Indicator -->
          <!-- Shows real-time validation of password requirements -->
          <div v-if="newPassword" class="password-requirements">
            <div :class="['requirement', passwordRequirements.minLength ? 'met' : 'not-met']">
              <span class="requirement-icon">{{ passwordRequirements.minLength ? 'Check' : 'X' }}</span>
              At least 10 characters
            </div>
            <div :class="['requirement', passwordRequirements.hasLetter ? 'met' : 'not-met']">
              <span class="requirement-icon">{{ passwordRequirements.hasLetter ? 'Check' : 'X' }}</span>
              At least one letter
            </div>
            <div :class="['requirement', passwordRequirements.hasNumber ? 'met' : 'not-met']">
              <span class="requirement-icon">{{ passwordRequirements.hasNumber ? 'Check' : 'X' }}</span>
              At least one number
            </div>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <!-- User re-enters password to ensure it was typed correctly -->
        <!-- Must exactly match New Password field -->
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            class="form-input"
            required
            :disabled="isLoading"
            @input="validatePasswordMatch"
          />
          <!-- Password Match Indicator -->
          <!-- Shows if confirmation password matches new password -->
          <div v-if="confirmPassword" :class="['match-indicator', passwordsMatch ? 'match' : 'no-match']">
            {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
          </div>
        </div>

        <!-- Reset Password Button -->
        <!-- Saves new password to database -->
        <!-- Only enabled when all requirements are met -->
        <button
          type="submit"
          class="reset-button"
          :disabled="isLoading || !isPasswordValid"
        >
          <span v-if="!isLoading">Save Password</span>
          <span v-else>Saving...</span>
        </button>
      </form>

      <!-- Back to Login Link -->
      <!-- User can return to login if they changed their mind -->
      <div class="back-to-login">
        <router-link to="/login" class="back-link">
          Back to Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import passwordResetService from '../../services/passwordResetService';

export default {
  name: 'ResetPassword',
  setup() {
    const router = useRouter();
    const route = useRoute();

    // =====================================================
    // REACTIVE DATA PROPERTIES
    // =====================================================

    // User's new password input
    const newPassword = ref('');

    // User's confirmation password input
    const confirmPassword = ref('');

    // Error message for form submission
    const errorMessage = ref('');

    // Success message after password reset
    const successMessage = ref('');

    // Loading state during password save
    const isLoading = ref(false);

    // Email address for password reset (from route param)
    // Passed from ForgotPassword component
    const email = ref(route.params.email || '');

    // =====================================================
    // PASSWORD REQUIREMENT TRACKING
    // =====================================================

    // Object tracking which password requirements are met
    // Used for real-time validation feedback
    const passwordRequirements = ref({
      minLength: false,     // At least 10 characters
      hasLetter: false,     // At least one letter
      hasNumber: false      // At least one number
    });

    // =====================================================
    // COMPUTED PROPERTIES
    // =====================================================

    // Check if passwords match (new and confirm are the same)
    const passwordsMatch = computed(() => {
      // Empty confirmPassword means user hasn't typed it yet
      if (!confirmPassword.value) {
        return false;
      }
      // Return true only if both passwords are identical
      return newPassword.value === confirmPassword.value;
    });

    // Check if all password requirements are met
    const allRequirementsMet = computed(() => {
      return (
        passwordRequirements.value.minLength &&
        passwordRequirements.value.hasLetter &&
        passwordRequirements.value.hasNumber
      );
    });

    // Check if form is valid and ready to submit
    const isPasswordValid = computed(() => {
      // Both passwords must match and meet all requirements
      return allRequirementsMet.value && passwordsMatch.value;
    });

    // =====================================================
    // METHODS
    // =====================================================

    // Validate new password against security requirements
    // Called on every character input
    // Updates passwordRequirements object with real-time feedback
    const validatePassword = () => {
      const password = newPassword.value;

      // Check minimum length requirement
      // Must be at least 10 characters
      passwordRequirements.value.minLength = password.length >= 10;

      // Check for at least one letter
      // Matches uppercase or lowercase letters
      passwordRequirements.value.hasLetter = /[a-zA-Z]/.test(password);

      // Check for at least one number
      // Matches any digit 0-9
      passwordRequirements.value.hasNumber = /\d/.test(password);

      // Reset password match if new password changed
      // User needs to re-enter confirm password
      if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
        // Keep confirmPassword as is, let validatePasswordMatch handle the check
      }
    };

    // Validate that confirmation password matches new password
    // Called when user types in confirm password field
    const validatePasswordMatch = () => {
      // Real-time comparison happens through computed property
      // This function exists for future expansion if needed
    };

    // Handle password reset form submission
    // Called when user clicks "Save Password" button
    const handleResetPassword = async () => {
      // Reset error messages
      errorMessage.value = '';
      successMessage.value = '';

      // Validate email is present
      // Email comes from route params passed from ForgotPassword
      if (!email.value) {
        errorMessage.value = 'Email address is missing. Please start over.';
        return;
      }

      // Validate password requirements one final time
      // Ensures all requirements are met before submission
      if (!allRequirementsMet.value) {
        errorMessage.value = 'Password does not meet all requirements';
        return;
      }

      // Validate passwords match
      // User must have entered the same password twice
      if (!passwordsMatch.value) {
        errorMessage.value = 'Passwords do not match. Please try again.';
        return;
      }

      // Set loading state
      isLoading.value = true;

      try {
        // Get verification code from session storage
        // This was stored when code was verified in ForgotPassword component
        const verificationCode = sessionStorage.getItem('resetCode');

        // Validate code exists
        if (!verificationCode) {
          errorMessage.value = 'Verification code not found. Please start over.';
          return;
        }

        // Call backend to reset password
        // Sends: email, verification code, new password
        // Backend performs final validations and updates password
        const response = await passwordResetService.resetPassword(
          email.value,
          verificationCode,
          newPassword.value
        );

        // Check if password reset was successful
        if (response.success) {
          // Show success message
          successMessage.value = response.message;

          // Clear session storage after use
          sessionStorage.removeItem('resetCode');
          sessionStorage.removeItem('resetEmail');

          // Wait 2 seconds then redirect to login page
          // Gives user time to see success message
          setTimeout(() => {
            router.push('/login');
          }, 2000);

        } else {
          // Show error from server
          errorMessage.value = response.message;
        }

      } catch (error) {
        // Handle unexpected errors
        console.error('Reset password error:', error);
        errorMessage.value = error.message || 'Failed to reset password. Please try again.';

      } finally {
        // Clear loading state
        isLoading.value = false;
      }
    };

    // =====================================================
    // COMPONENT INITIALIZATION
    // =====================================================

    // Verify email is present from route params
    // If not present, redirect back to forgot password
    if (!email.value) {
      console.warn('No email found in route params. Redirecting to forgot password.');
      router.push('/forgot-password');
    }

    // Return all reactive properties and methods
    return {
      newPassword,
      confirmPassword,
      errorMessage,
      successMessage,
      isLoading,
      email,
      passwordRequirements,
      passwordsMatch,
      allRequirementsMet,
      isPasswordValid,
      validatePassword,
      validatePasswordMatch,
      handleResetPassword
    };
  }
};
</script>

<style scoped>
/* =====================================================
   MAIN CONTAINER STYLES
   ===================================================== */

.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  padding: 20px;
}

.reset-password-box {
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
  line-height: 1.5;
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

/* =====================================================
   PASSWORD REQUIREMENTS DISPLAY
   ===================================================== */

.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: color 0.3s ease;
}

.requirement.met {
  color: #3c3;
}

.requirement.not-met {
  color: #999;
}

.requirement-icon {
  font-weight: bold;
  display: inline-block;
  width: 16px;
  text-align: center;
}

/* =====================================================
   PASSWORD MATCH INDICATOR
   ===================================================== */

.match-indicator {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.match-indicator.match {
  background-color: #efe;
  color: #3c3;
}

.match-indicator.no-match {
  background-color: #fee;
  color: #c33;
}

/* =====================================================
   BUTTON STYLES
   ===================================================== */

.reset-button {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.reset-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.reset-button:active:not(:disabled) {
  transform: translateY(0);
}

.reset-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  .reset-password-box {
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

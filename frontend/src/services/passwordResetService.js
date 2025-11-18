import axios from 'axios';

// Configuration for API base URL
// Change this to match your backend server address
// Example: 'http://localhost:3000/api' for local development
// Example: 'https://api.aptexchange.com/api' for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance for API calls
// Uses API_BASE_URL as base for all requests
// Includes default headers for JSON communication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Password reset service object
// Contains all functions for password reset API communication
const passwordResetService = {

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================
  // Purpose: Send verification code to user's email
  // Endpoint: POST /auth/forgot-password
  // Parameters:
  //   - email: User's email address
  // Returns: Promise resolving to API response
  // Response: { success, message, email }
  forgotPassword: async (email) => {
    try {
      // Validate email is provided
      if (!email || !email.trim()) {
        return {
          success: false,
          message: 'Email address is required'
        };
      }

      // Make POST request to backend
      // Sends: email in request body
      // Receives: success status and message
      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim()
      });

      // Backend request succeeded (status 200)
      // Return response data to caller
      return response.data;

    } catch (error) {
      // Handle error responses from backend
      // Check if error has response data from server
      if (error.response && error.response.data) {
        // Return error response from backend
        // Includes error message from server
        return error.response.data;
      }

      // Handle network errors or server unreachable
      // Log error for debugging
      console.error('Forgot password error:', error);

      // Return generic error response
      return {
        success: false,
        message: error.message || 'Failed to send verification code. Please check your connection and try again.'
      };
    }
  },

  // =====================================================
  // VERIFY EMAIL
  // =====================================================
  // Purpose: Check if email exists in user database
  // Endpoint: POST /auth/verify-email
  // Parameters:
  //   - email: Email address to verify
  // Returns: Promise resolving to API response
  // Response: { success, emailExists, message }
  verifyEmail: async (email) => {
    try {
      // Validate email is provided
      if (!email || !email.trim()) {
        return {
          success: false,
          emailExists: false,
          message: 'Email address is required'
        };
      }

      // Make POST request to backend
      // Sends: email in request body
      // Receives: whether email exists in database
      const response = await apiClient.post('/auth/verify-email', {
        email: email.trim()
      });

      // Backend request succeeded
      // Return response with emailExists flag
      return response.data;

    } catch (error) {
      // Handle error responses
      if (error.response && error.response.data) {
        return error.response.data;
      }

      console.error('Verify email error:', error);
      return {
        success: false,
        emailExists: false,
        message: 'Failed to verify email. Please try again.'
      };
    }
  },

  // =====================================================
  // VERIFY CODE
  // =====================================================
  // Purpose: Validate verification code provided by user
  // Endpoint: POST /auth/verify-code
  // Parameters:
  //   - email: User's email address
  //   - verificationCode: 6-digit code from email
  // Returns: Promise resolving to API response
  // Response: { success, message, email, attemptsRemaining }
  verifyCode: async (email, verificationCode) => {
    try {
      // Validate required fields
      if (!email || !email.trim() || !verificationCode) {
        return {
          success: false,
          message: 'Email and verification code are required'
        };
      }

      // Validate code format (should be 6 digits)
      if (!/^\d{6}$/.test(verificationCode)) {
        return {
          success: false,
          message: 'Verification code must be 6 digits'
        };
      }

      // Make POST request to backend
      // Sends: email and verification code
      // Receives: verification result and remaining attempts
      const response = await apiClient.post('/auth/verify-code', {
        email: email.trim(),
        verificationCode: verificationCode
      });

      // Backend request succeeded
      // Return response with verification result
      return response.data;

    } catch (error) {
      // Handle error responses
      if (error.response && error.response.data) {
        return error.response.data;
      }

      console.error('Verify code error:', error);
      return {
        success: false,
        message: 'Failed to verify code. Please try again.'
      };
    }
  },

  // =====================================================
  // RESET PASSWORD
  // =====================================================
  // Purpose: Update user's password after verification
  // Endpoint: POST /auth/reset-password
  // Parameters:
  //   - email: User's email address
  //   - verificationCode: 6-digit code (verified in previous step)
  //   - newPassword: New password to set
  // Returns: Promise resolving to API response
  // Response: { success, message }
  // Security: Password sent over HTTPS only
  resetPassword: async (email, verificationCode, newPassword) => {
    try {
      // Validate all required fields
      if (!email || !email.trim() || !verificationCode || !newPassword) {
        return {
          success: false,
          message: 'Email, verification code, and password are required'
        };
      }

      // Validate password length (should be 10+ characters)
      if (newPassword.length < 10) {
        return {
          success: false,
          message: 'Password must be at least 10 characters long'
        };
      }

      // Validate password has at least one letter
      if (!/[a-zA-Z]/.test(newPassword)) {
        return {
          success: false,
          message: 'Password must contain at least one letter'
        };
      }

      // Validate password has at least one number
      if (!/\d/.test(newPassword)) {
        return {
          success: false,
          message: 'Password must contain at least one number'
        };
      }

      // Make POST request to backend
      // Sends: email, verification code, new password
      // Receives: success status and message
      // IMPORTANT: This request MUST use HTTPS in production
      // Password is sent in request body - requires encryption
      const response = await apiClient.post('/auth/reset-password', {
        email: email.trim(),
        verificationCode: verificationCode,
        newPassword: newPassword
      });

      // Backend request succeeded
      // Return response indicating password was saved
      return response.data;

    } catch (error) {
      // Handle error responses
      if (error.response && error.response.data) {
        return error.response.data;
      }

      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Failed to reset password. Please try again.'
      };
    }
  }
};

// Export password reset service for use in components
// Imported by ForgotPassword and ResetPassword components
export default passwordResetService;

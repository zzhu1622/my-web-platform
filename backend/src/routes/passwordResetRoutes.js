const express = require('express');
const passwordResetController = require('../controllers/passwordResetController');

// Create Express router for password reset routes
// Router will be mounted at /api/auth in main app
const router = express.Router();

// =====================================================
// ROUTE: POST /api/auth/forgot-password
// =====================================================
// Purpose: Initiate password reset process by sending verification code
// Request Body:
//   {
//     email: string - User's email address
//   }
// Response Success (200):
//   {
//     success: boolean - true
//     message: string - Confirmation message
//   }
// Response Error (400/500):
//   {
//     success: boolean - false
//     message: string - Error description
//   }
// Process:
//   1. Validate email format
//   2. Check if email exists in user database
//   3. Generate random 6-digit verification code
//   4. Hash code and save to verification_codes table with 15-minute expiration
//   5. Send code to user's email via SMTP
//   6. Return success message
// Security:
//   - Email validation prevents invalid addresses
//   - Code is hashed before storage (never plaintext)
//   - Generic response prevents email enumeration attacks
//   - Rate limiting recommended (not shown, add to middleware)
// Rate Limit: Recommend 5 requests per 15 minutes per IP
router.post('/forgot-password', passwordResetController.forgotPassword);

// =====================================================
// ROUTE: POST /api/auth/verify-email
// =====================================================
// Purpose: Check if email exists in user database
// Request Body:
//   {
//     email: string - Email to verify
//   }
// Response Success (200):
//   {
//     success: boolean - true
//     emailExists: boolean - true if email found, false otherwise
//     message: string - Result message
//   }
// Response Error (400/500):
//   {
//     success: boolean - false
//     message: string - Error description
//   }
// Purpose:
//   - Frontend checks email validity early in forgot password form
//   - Provides immediate feedback to user
//   - Helps user identify if they entered correct email
// Security:
//   - Query only checks existence, doesn't return user data
//   - No password reset information leaked
//   - Safe to call from frontend multiple times
// Rate Limit: Recommend 10 requests per minute per IP
router.post('/verify-email', passwordResetController.verifyEmail);

// =====================================================
// ROUTE: POST /api/auth/verify-code
// =====================================================
// Purpose: Validate verification code and check all validity conditions
// Request Body:
//   {
//     email: string - User's email address
//     verificationCode: string - 6-digit code user entered
//   }
// Response Success (200):
//   {
//     success: boolean - true
//     message: string - Success confirmation
//     email: string - Email for next step
//   }
// Response Error (400/500):
//   {
//     success: boolean - false
//     message: string - Error description (code expired, locked, incorrect, etc.)
//     attemptsRemaining: number - (optional) attempts left before code locks
//   }
// Validations Performed:
//   1. Code exists in database for email
//   2. Code has not expired (must be within 15 minutes of generation)
//   3. Code has not been used (each code only works once)
//   4. Code has not been locked (failed attempts < 6)
//   5. Provided code matches stored hash
// Security:
//   - Code compared using bcrypt compare (immune to timing attacks)
//   - Failed attempts counter prevents brute force (6 attempt limit)
//   - Expired codes rejected (15 minute window)
//   - Used codes rejected (prevents reuse)
// Rate Limit: Recommend 20 requests per minute per IP
router.post('/verify-code', passwordResetController.verifyCode);

// =====================================================
// ROUTE: POST /api/auth/reset-password
// =====================================================
// Purpose: Update user's password after email and code verification
// Request Body:
//   {
//     email: string - User's email address
//     verificationCode: string - 6-digit code (verified in previous step)
//     newPassword: string - New password to set
//   }
// Response Success (200):
//   {
//     success: boolean - true
//     message: string - Success confirmation
//   }
// Response Error (400/500):
//   {
//     success: boolean - false
//     message: string - Error description
//     attemptsRemaining: number - (optional) if code incorrect
//   }
// Password Requirements (validated before update):
//   - Minimum 10 characters
//   - At least one letter (uppercase or lowercase)
//   - At least one number
//   - Case sensitive
// Security Checks:
//   1. Email exists in user database
//   2. Verification code is valid (not expired, not used, not locked)
//   3. Provided code matches stored hash
//   4. New password meets all security requirements
// Process:
//   1. Validate all inputs
//   2. Check email exists
//   3. Verify code validity
//   4. Compare provided code against hash
//   5. Hash new password using bcrypt
//   6. Update user password in database
//   7. Mark verification code as used (prevents reuse)
//   8. Return success message
// Security:
//   - Passwords never stored plaintext (hashed with bcrypt)
//   - Old password not needed (code verification proves email ownership)
//   - Code marked as used immediately (one-time use)
//   - Failed code attempts still tracked before password update
//   - HTTPS required in production (password in transit)
// Rate Limit: Recommend 5 requests per 30 minutes per IP
router.post('/reset-password', passwordResetController.resetPassword);

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================
// Catches any unhandled errors in route handlers
// Logs error and returns generic response to prevent information leakage
router.use((error, req, res, next) => {
    // Log full error details for debugging (server side only)
    console.error('Password reset route error:', error);

    // Return generic error response to client
    // Don't expose specific error details for security
    res.status(500).json({
        success: false,
        message: 'An error occurred. Please try again later.'
    });
});

// Export router for use in main Express app
// Imported by backend server file and mounted at appropriate path
// Example: app.use('/api/auth', passwordResetRoutes);
module.exports = router;
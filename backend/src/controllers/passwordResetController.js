const bcrypt = require('bcrypt');
const pool = require('../config/database');
const verificationCodeService = require('../services/verificationCodeService');
const emailService = require('../services/emailService');

// Password reset controller module
// Contains all API endpoint handlers for password reset flow
const passwordResetController = {

    // =====================================================
    // FORGOT PASSWORD ENDPOINT
    // =====================================================
    // HTTP: POST /api/auth/forgot-password
    // Purpose: Initiate password reset by sending verification code
    // Request: { email: 'user@example.com' }
    // Response: { success: boolean, message: string }
    // Process:
    //   1. Validate email format
    //   2. Check if email exists in user database
    //   3. Generate 6-digit verification code
    //   4. Hash code and save to verification_codes table
    //   5. Send code to user's email
    forgotPassword: async (req, res) => {
        try {
            // Extract email from request body
            // Email is required and should be validated
            const { email } = req.body;

            // Validate email is provided
            // Return error if email field is missing or empty
            if (!email || !email.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Email address is required'
                });
            }

            // Validate email format using regex
            // Pattern: basic email validation (can be enhanced with email-validator package)
            // Matches: something@domain.something
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid email address'
                });
            }

            // Check if email exists in user database
            // Get database connection from pool
            const connection = await pool.getConnection();

            try {
                // Query user table to find account with provided email
                // Only select uid and name (don't need sensitive data here)
                const query = 'SELECT uid, name FROM User WHERE email = ?';
                const [rows] = await connection.execute(query, [email]);

                // If email not found in database, user hasn't registered
                // Don't reveal whether email exists (security best practice)
                // Return generic success message to prevent email enumeration
                if (rows.length === 0) {
                    // For security: return success even if email not found
                    // This prevents attackers from discovering which emails are registered
                    // In production, might want to log this for fraud detection
                    return res.status(200).json({
                        success: true,
                        message: 'If this email is registered, a verification code will be sent shortly'
                    });
                }

                // Email found - extract user information
                // uid: user's unique identifier
                // name: user's name for personalized email
                const user = rows[0];

                // Generate new verification code
                // Returns object with: code (plain text for sending) and hash (for storage)
                const { code, hash } = await verificationCodeService.generateVerificationCode();

                // Save verification code to database
                // Stores: user id, email, code hash, expiration time
                // Plain code is NOT stored, only hash is saved
                await verificationCodeService.saveVerificationCode(user.uid, email, hash);

                // Send verification code to user's email
                // Includes: user name, email address, verification code
                // Returns: success status and message ID
                const emailResult = await emailService.sendVerificationCodeEmail(
                    email,
                    user.name,
                    code
                );

                // Check if email was sent successfully
                // If email service fails, inform user to try again
                if (!emailResult.success) {
                    console.error('Failed to send verification code email:', emailResult.error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to send verification code. Please try again.'
                    });
                }

                // Email sent successfully
                // Return success response to frontend
                return res.status(200).json({
                    success: true,
                    message: 'Verification code has been sent to your email address. It will expire in 15 minutes.'
                });

            } finally {
                // Always release database connection back to pool
                // Prevents connection leaks and exhausting pool
                connection.release();
            }

        } catch (error) {
            // Catch unexpected errors in password reset process
            // Log error for debugging but don't expose details to user
            console.error('Forgot password error:', error);

            // Return generic error message to user
            // Don't reveal specific error details for security
            return res.status(500).json({
                success: false,
                message: 'An error occurred while processing your request. Please try again.'
            });
        }
    },

    // =====================================================
    // VERIFY EMAIL ENDPOINT
    // =====================================================
    // HTTP: POST /api/auth/verify-email
    // Purpose: Check if email exists in user database
    // Request: { email: 'user@example.com' }
    // Response: { success: boolean, emailExists: boolean }
    // Used By: Frontend to show appropriate error message early
    verifyEmail: async (req, res) => {
        try {
            // Extract email from request body
            const { email } = req.body;

            // Validate email is provided
            if (!email || !email.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Email address is required'
                });
            }

            // Get database connection from pool
            const connection = await pool.getConnection();

            try {
                // Query user table to check email existence
                // Uses COUNT(*) to get result even if no rows found
                const query = 'SELECT COUNT(*) as count FROM User WHERE email = ?';
                const [rows] = await connection.execute(query, [email]);

                // Extract count from result
                // count will be 0 if email not found, 1 if found
                const emailExists = rows[0].count > 0;

                // Return result to frontend
                return res.status(200).json({
                    success: true,
                    emailExists: emailExists,
                    message: emailExists ? 'Email found' : 'Email not found'
                });

            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('Verify email error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error verifying email'
            });
        }
    },

    // =====================================================
    // VERIFY CODE ENDPOINT
    // =====================================================
    // HTTP: POST /api/auth/verify-code
    // Purpose: Validate verification code provided by user
    // Request: { email: 'user@example.com', verificationCode: '123456' }
    // Response: { success: boolean, message: string }
    // Validations:
    //   - Code matches hash in database
    //   - Code hasn't expired (15 minutes)
    //   - Code hasn't been used already
    //   - Failed attempts < 6 (code not locked)
    verifyCode: async (req, res) => {
        try {
            // Extract email and code from request body
            const { email, verificationCode } = req.body;

            // Validate required fields
            // Both email and code must be provided
            if (!email || !email.trim() || !verificationCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and verification code are required'
                });
            }

            // Verify code format (should be 6 digits)
            // Basic format check before database query
            if (!/^\d{6}$/.test(verificationCode)) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification code must be 6 digits'
                });
            }

            // Get active verification code record from database
            // Retrieves unused, non-expired code with < 6 failed attempts
            const codeRecord = await verificationCodeService.getActiveCode(email);

            // Check if code record exists
            // If no record found, code doesn't exist or is invalid
            if (!codeRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification code not found. Please request a new code.'
                });
            }

            // Check code validity (expiration, locked status, etc.)
            // Returns object with: isValid (boolean) and message (string)
            const validityCheck = verificationCodeService.checkCodeValidity(codeRecord);

            // If code is invalid for any reason, return error
            // Message explains why code is invalid
            if (!validityCheck.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validityCheck.message
                });
            }

            // Verify provided code against stored hash
            // Uses bcrypt compare for secure comparison
            // Returns true if code matches hash
            const codeMatches = await verificationCodeService.verifyCode(
                verificationCode,
                codeRecord.code_hash
            );

            // If code doesn't match hash, increment failed attempts
            // Prevents brute force attacks by limiting wrong attempts
            if (!codeMatches) {
                // Increment failed attempts counter
                // After 6 failures, code will be locked
                const updatedAttempts = await verificationCodeService.incrementFailedAttempts(
                    codeRecord.code_id
                );

                // Check if code is now locked (attempts >= 6)
                // If locked, user must request new code
                if (updatedAttempts >= 6) {
                    return res.status(400).json({
                        success: false,
                        message: 'Too many incorrect attempts. Please request a new verification code.',
                        attemptsRemaining: 0
                    });
                }

                // Code incorrect but not yet locked
                // Return error with remaining attempts
                return res.status(400).json({
                    success: false,
                    message: 'Verification code is incorrect. Please try again.',
                    attemptsRemaining: 6 - updatedAttempts
                });
            }

            // Code matches successfully
            // Return success response
            // Frontend will proceed to password reset page
            return res.status(200).json({
                success: true,
                message: 'Verification code verified successfully. You can now reset your password.',
                email: email
            });

        } catch (error) {
            console.error('Verify code error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error verifying code'
            });
        }
    },

    // =====================================================
    // RESET PASSWORD ENDPOINT
    // =====================================================
    // HTTP: POST /api/auth/reset-password
    // Purpose: Update user's password after verification
    // Request: {
    //   email: 'user@example.com',
    //   verificationCode: '123456',
    //   newPassword: 'SecurePassword123'
    // }
    // Response: { success: boolean, message: string }
    // Validations:
    //   - Code is valid (not expired, not used, not locked)
    //   - Code matches provided
    //   - Password meets requirements (10+ chars, letters and numbers)
    //   - Email exists in user table
    resetPassword: async (req, res) => {
        try {
            // Extract credentials from request body
            const { email, verificationCode, newPassword } = req.body;

            // Validate all required fields are provided
            // Email, code, and new password are all mandatory
            if (!email || !email.trim() || !verificationCode || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, verification code, and new password are required'
                });
            }

            // Validate new password meets security requirements
            // Must have at least 10 characters
            if (newPassword.length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 10 characters long'
                });
            }

            // Check for at least one letter in password
            // Case insensitive check for any alphabetic character
            if (!/[a-zA-Z]/.test(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must contain at least one letter'
                });
            }

            // Check for at least one number in password
            // Ensures password has both letters and numbers
            if (!/\d/.test(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must contain at least one number'
                });
            }

            // Get database connection from pool
            const connection = await pool.getConnection();

            try {
                // Step 1: Verify email exists in user table
                // Need to confirm user exists before updating password
                const userQuery = 'SELECT uid FROM User WHERE email = ?';
                const [userRows] = await connection.execute(userQuery, [email]);

                // If user not found with this email
                // Cannot reset password for non-existent user
                if (userRows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email address not found in our records'
                    });
                }

                // Extract user ID from result
                const userId = userRows[0].uid;

                // Step 2: Verify code validity
                // Get code record to validate it exists and is usable
                const codeRecord = await verificationCodeService.getActiveCode(email);

                // Check if code record exists
                if (!codeRecord) {
                    return res.status(400).json({
                        success: false,
                        message: 'Verification code not found. Please request a new code.'
                    });
                }

                // Check code validity (expiration, usage, attempts)
                const validityCheck = verificationCodeService.checkCodeValidity(codeRecord);

                // If code is invalid, return specific error message
                if (!validityCheck.isValid) {
                    return res.status(400).json({
                        success: false,
                        message: validityCheck.message
                    });
                }

                // Step 3: Verify code matches provided code
                // Ensure user provided correct code
                const codeMatches = await verificationCodeService.verifyCode(
                    verificationCode,
                    codeRecord.code_hash
                );

                // If code doesn't match
                if (!codeMatches) {
                    // Increment failed attempts
                    const updatedAttempts = await verificationCodeService.incrementFailedAttempts(
                        codeRecord.code_id
                    );

                    // Return error with remaining attempts
                    return res.status(400).json({
                        success: false,
                        message: 'Verification code is incorrect',
                        attemptsRemaining: Math.max(0, 6 - updatedAttempts)
                    });
                }

                // Step 4: Hash new password
                // Use bcrypt with 10 salt rounds for security
                // Never store plaintext passwords in database
                const passwordHash = await bcrypt.hash(newPassword, 10);

                // Step 5: Update user password in database
                // Update User table with new hashed password
                const updateQuery = 'UPDATE User SET password = ? WHERE email = ?';
                await connection.execute(updateQuery, [passwordHash, email]);

                // Step 6: Mark verification code as used
                // Prevents this code from being used again
                // Sets is_used = 1 and used_at = now
                await verificationCodeService.markCodeAsUsed(codeRecord.code_id);

                // All steps completed successfully
                // Password has been reset and code marked as used
                return res.status(200).json({
                    success: true,
                    message: 'Your password has been reset successfully. You can now login with your new password.'
                });

            } finally {
                // Always release database connection
                connection.release();
            }

        } catch (error) {
            // Catch unexpected errors
            // Log for debugging but don't expose details to user
            console.error('Reset password error:', error);

            // Return generic error message
            return res.status(500).json({
                success: false,
                message: 'An error occurred while resetting your password. Please try again.'
            });
        }
    }
};

// Export password reset controller for use in route file
// Imported by passwordResetRoutes to handle API endpoints
module.exports = passwordResetController;
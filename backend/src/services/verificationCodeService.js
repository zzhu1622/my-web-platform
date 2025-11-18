const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Verification code service module
// Contains all functions for managing password reset verification codes
const verificationCodeService = {

    // =====================================================
    // GENERATE VERIFICATION CODE
    // =====================================================
    // Purpose: Generate random 6-digit verification code and hash for storage
    // Returns: Object with plain code and hash
    // Security: Code is hashed for database storage, never stores plaintext
    generateVerificationCode: async () => {
        try {
            // Generate random 6-digit number (000000 to 999999)
            // Math.random() produces decimal, multiply by 1000000, floor to integer
            // Pad with zeros to ensure exactly 6 digits (e.g., 5 becomes 000005)
            const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

            // Hash the plain code using bcrypt with salt rounds of 10
            // bcrypt converts code to hash that cannot be reversed
            // This protects database if it is compromised - hashes cannot be converted back to codes
            // Salt rounds 10 provides good security vs performance balance
            const hash = await bcrypt.hash(code, 10);

            // Return both code (for sending to user) and hash (for storing in database)
            // Code: plain text sent via email to user
            // Hash: stored in database for later verification
            return {
                code: code,
                hash: hash
            };

        } catch (error) {
            console.error('Error generating verification code:', error);
            throw new Error('Failed to generate verification code');
        }
    },

    // =====================================================
    // SAVE VERIFICATION CODE
    // =====================================================
    // Purpose: Save generated verification code to database
    // Parameters:
    //   - uid: User ID attempting password reset
    //   - email: User's email address
    //   - codeHash: Bcrypt hash of verification code
    // Returns: Result of database insert operation
    // Security: Only hash is stored, never plaintext code
    saveVerificationCode: async (uid, email, codeHash) => {
        const connection = await pool.getConnection();

        try {
            // Calculate expiration time: current time plus 15 minutes
            // Codes are valid for exactly 15 minutes from generation
            // This time limit prevents unauthorized use of old codes
            const expirationTime = new Date(Date.now() + 15 * 60 * 1000);

            // SQL insert statement for new verification code record
            // Stores: user ID, email, hashed code, expiration time, creation time
            // All sensitive data is hashed or encrypted before storage
            const query = `
        INSERT INTO verification_codes (uid, email, code_hash, expiration_time, created_at, is_used, failed_attempts)
        VALUES (?, ?, ?, ?, NOW(), 0, 0)
      `;

            // Execute the insert with prepared statement (prevents SQL injection)
            // Parameters: uid, email, codeHash, expirationTime
            const [result] = await connection.execute(query, [uid, email, codeHash, expirationTime]);

            // Return result object containing insertId and affectedRows
            // insertId: auto-generated code_id from database
            // affectedRows: number of rows inserted (should be 1)
            return result;

        } catch (error) {
            console.error('Error saving verification code:', error);
            throw new Error('Failed to save verification code to database');

        } finally {
            // Release database connection back to pool
            // Important to prevent connection leaks and exhausting pool
            connection.release();
        }
    },

    // =====================================================
    // VERIFY VERIFICATION CODE
    // =====================================================
    // Purpose: Validate provided code against stored hash
    // Parameters:
    //   - plainCode: 6-digit code provided by user
    //   - hash: Bcrypt hash stored in database
    // Returns: Boolean indicating if code matches
    // Security: Uses bcrypt compare, never does string equality comparison
    verifyCode: async (plainCode, hash) => {
        try {
            // Use bcrypt compare to safely verify code against hash
            // bcrypt compare is immune to timing attacks
            // Returns true if code produces same hash, false otherwise
            // Never use simple string equality (== or ===) for password/code verification
            const isValid = await bcrypt.compare(plainCode, hash);

            // Return boolean result
            return isValid;

        } catch (error) {
            console.error('Error verifying code:', error);
            throw new Error('Failed to verify code');
        }
    },

    // =====================================================
    // GET ACTIVE CODE
    // =====================================================
    // Purpose: Retrieve valid (unused and not expired) code for user
    // Parameters:
    //   - email: User's email address
    // Returns: Code record from database or null if none found
    // Validations: Checks not expired, not used, and not locked (too many attempts)
    getActiveCode: async (email) => {
        const connection = await pool.getConnection();

        try {
            // SQL query to find most recent unused code for email that hasn't expired
            // Selects all fields except the hash (handled separately if needed)
            // WHERE conditions:
            //   - email matches provided email
            //   - is_used = 0 (code hasn't been used yet)
            //   - expiration_time > NOW() (code hasn't expired)
            //   - failed_attempts < 6 (code hasn't been locked due to too many failures)
            // ORDER BY created_at DESC gets most recent code if multiple exist
            // LIMIT 1 returns only one result
            const query = `
        SELECT code_id, uid, email, code_hash, expiration_time, created_at, used_at, is_used, failed_attempts
        FROM verification_codes
        WHERE email = ? AND is_used = 0 AND expiration_time > NOW() AND failed_attempts < 6
        ORDER BY created_at DESC
        LIMIT 1
      `;

            // Execute query with prepared statement
            // Parameter: email address to search for
            const [rows] = await connection.execute(query, [email]);

            // Return first result if found, otherwise return null
            // rows[0] contains the most recent valid code record
            return rows.length > 0 ? rows[0] : null;

        } catch (error) {
            console.error('Error getting active code:', error);
            throw new Error('Failed to retrieve verification code');

        } finally {
            connection.release();
        }
    },

    // =====================================================
    // MARK CODE AS USED
    // =====================================================
    // Purpose: Mark verification code as used after successful password reset
    // Parameters:
    //   - codeId: ID of the code record to mark as used
    // Returns: Result of database update operation
    // Effect: Sets is_used = 1 and used_at = current timestamp
    markCodeAsUsed: async (codeId) => {
        const connection = await pool.getConnection();

        try {
            // SQL update statement to mark code as used
            // Sets: is_used = 1, used_at = current timestamp
            // WHERE: code_id matches specified codeId
            const query = `
        UPDATE verification_codes
        SET is_used = 1, used_at = NOW()
        WHERE code_id = ?
      `;

            // Execute update with prepared statement
            // Parameter: codeId to identify which code to update
            const [result] = await connection.execute(query, [codeId]);

            // Return result indicating number of rows affected
            // Should be 1 if code existed and was updated
            return result;

        } catch (error) {
            console.error('Error marking code as used:', error);
            throw new Error('Failed to mark verification code as used');

        } finally {
            connection.release();
        }
    },

    // =====================================================
    // INCREMENT FAILED ATTEMPTS
    // =====================================================
    // Purpose: Increment failed attempt counter when user enters wrong code
    // Parameters:
    //   - codeId: ID of the code record
    // Returns: Updated failed_attempts count
    // Security: After 6 failures, code becomes invalid and locked
    incrementFailedAttempts: async (codeId) => {
        const connection = await pool.getConnection();

        try {
            // SQL update to increment failed_attempts counter
            // failed_attempts + 1 increases counter by 1
            // WHERE code_id matches specified codeId
            const query = `
        UPDATE verification_codes
        SET failed_attempts = failed_attempts + 1
        WHERE code_id = ?
      `;

            // Execute update with prepared statement
            // Parameter: codeId to identify which code to increment
            const [result] = await connection.execute(query, [codeId]);

            // Get updated failed_attempts count
            // SELECT query to confirm new value
            const selectQuery = `SELECT failed_attempts FROM verification_codes WHERE code_id = ?`;
            const [rows] = await connection.execute(selectQuery, [codeId]);

            // Return updated attempts count
            // Used to check if code is now locked (attempts >= 6)
            return rows.length > 0 ? rows[0].failed_attempts : null;

        } catch (error) {
            console.error('Error incrementing failed attempts:', error);
            throw new Error('Failed to update attempt counter');

        } finally {
            connection.release();
        }
    },

    // =====================================================
    // CHECK CODE VALIDITY
    // =====================================================
    // Purpose: Check all validity conditions for a verification code
    // Parameters:
    //   - codeRecord: The code record from database
    // Returns: Object with validity status and reasons for invalidity
    // Checks: Not expired, not used, not locked (attempts < 6), exists
    checkCodeValidity: (codeRecord) => {
        // Initialize validity response object
        // Contains isValid boolean and detailed error message
        const response = {
            isValid: true,
            message: ''
        };

        // Check if code record was found in database
        // If no record found, code doesn't exist
        if (!codeRecord) {
            response.isValid = false;
            response.message = 'Verification code not found. Please request a new code.';
            return response;
        }

        // Check if code has already been used
        // is_used = 1 means code was already used for password reset
        if (codeRecord.is_used === 1) {
            response.isValid = false;
            response.message = 'Verification code has already been used. Please request a new code.';
            return response;
        }

        // Check if code has expired
        // Compare expiration_time with current time
        const now = new Date();
        const expirationTime = new Date(codeRecord.expiration_time);
        if (now > expirationTime) {
            response.isValid = false;
            response.message = 'Verification code has expired. Please request a new code.';
            return response;
        }

        // Check if code is locked due to too many failed attempts
        // Maximum 6 failed attempts allowed
        if (codeRecord.failed_attempts >= 6) {
            response.isValid = false;
            response.message = 'Verification code is locked due to too many failed attempts. Please request a new code.';
            return response;
        }

        // All checks passed - code is valid
        // Message is empty for valid codes
        return response;
    },

    // =====================================================
    // DELETE EXPIRED CODES
    // =====================================================
    // Purpose: Clean up expired verification codes from database
    // Called: Periodically by maintenance job (e.g., daily)
    // Effect: Removes codes where expiration_time < now() AND is_used = 0
    deleteExpiredCodes: async () => {
        const connection = await pool.getConnection();

        try {
            // SQL delete statement to remove expired unused codes
            // WHERE conditions:
            //   - expiration_time < NOW() (code has expired)
            //   - is_used = 0 (code was never used)
            // This cleanup prevents database from growing with old codes
            const query = `
        DELETE FROM verification_codes
        WHERE expiration_time < NOW() AND is_used = 0
      `;

            // Execute delete with prepared statement
            const [result] = await connection.execute(query);

            // Log cleanup results
            console.log(`Deleted ${result.affectedRows} expired verification codes`);

            // Return number of deleted codes
            return result.affectedRows;

        } catch (error) {
            console.error('Error deleting expired codes:', error);
            throw new Error('Failed to delete expired verification codes');

        } finally {
            connection.release();
        }
    },

    // =====================================================
    // DELETE USED CODES (OPTIONAL)
    // =====================================================
    // Purpose: Clean up old used codes after retention period (optional)
    // Called: Periodically by maintenance job
    // Parameters:
    //   - retentionDays: Number of days to retain used codes (default 7)
    // Effect: Removes used codes older than retention period
    deleteOldUsedCodes: async (retentionDays = 7) => {
        const connection = await pool.getConnection();

        try {
            // SQL delete statement to remove old used codes
            // WHERE conditions:
            //   - is_used = 1 (code was used for successful password reset)
            //   - used_at < NOW() - INTERVAL retentionDays (code was used more than retention days ago)
            // This keeps database clean while maintaining audit trail for a reasonable period
            const query = `
        DELETE FROM verification_codes
        WHERE is_used = 1 AND used_at < NOW() - INTERVAL ? DAY
      `;

            // Execute delete with prepared statement
            // Parameter: number of days for retention period
            const [result] = await connection.execute(query, [retentionDays]);

            // Log cleanup results
            console.log(`Deleted ${result.affectedRows} old used verification codes`);

            // Return number of deleted codes
            return result.affectedRows;

        } catch (error) {
            console.error('Error deleting old used codes:', error);
            throw new Error('Failed to delete old used verification codes');

        } finally {
            connection.release();
        }
    }
};

// Export verification code service for use in other modules
// Imported by controllers and API routes for password reset functionality
module.exports = verificationCodeService;
// File: backend/src/controllers/sessionController.js
// Purpose: Handles user session operations including logout, status checking, and history
// Functions: logout, getSessionStatus, getUserSessions

const pool = require('../config/database');

/**
 * Logout Function
 * Records user logout in the database by updating the session record
 * Sets logout_time to current timestamp and is_online to 0
 *
 * Expected request body:
 * {
 *   sessionID: number,
 *   UID: number
 * }
 *
 * Response on success:
 * {
 *   success: true,
 *   message: 'Logout successful',
 *   sessionID: number
 * }
 */
exports.logout = async (req, res) => {
    try {
        // Get session ID and UID from request body
        const { sessionID, UID } = req.body;

        // Validate input - both sessionID and UID are required
        if (!sessionID || !UID) {
            return res.status(400).json({
                success: false,
                message: 'Session ID and UID are required'
            });
        }

        // Get database connection from pool
        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            // Database connection failed
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // SQL query to update session record
            // Sets logout_time to current timestamp (NOW())
            // Sets is_online flag to 0 (offline)
            // Only updates if SessionID and UID match (security check)
            const updateQuery = `
        UPDATE UserSession
        SET logout_time = NOW(), is_online = 0
        WHERE SessionID = ? AND UID = ?
      `;

            // Execute the update query with parameters
            const [updateResult] = await connection.execute(updateQuery, [sessionID, UID]);

            // Release connection back to pool
            connection.release();

            // Check if the session was found and updated
            // affectedRows = 0 means no session matched the criteria
            if (updateResult.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }

            // Logout successful
            return res.status(200).json({
                success: true,
                message: 'Logout successful',
                sessionID: sessionID
            });

        } catch (queryError) {
            // Database query execution failed
            connection.release();
            console.error('Session update error:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to update session'
            });
        }

    } catch (error) {
        // Unexpected server error
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Get Session Status Function
 * Retrieves the current session status for a user
 * Returns whether user is currently online and their active session info
 *
 * Expected URL parameter:
 * /api/session/status/:UID
 *
 * Response:
 * {
 *   success: true,
 *   isOnline: boolean,
 *   session: { SessionID, UID, login_time, is_online } or null
 * }
 */
exports.getSessionStatus = async (req, res) => {
    try {
        // Get UID from URL parameter
        const { UID } = req.params;

        // Validate input - UID is required
        if (!UID) {
            return res.status(400).json({
                success: false,
                message: 'UID is required'
            });
        }

        // Get database connection from pool
        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            // Database connection failed
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // SQL query to find user's current active session
            // WHERE is_online = 1: Only gets online sessions (no logout_time)
            // ORDER BY login_time DESC: Gets most recent session first
            // LIMIT 1: Only returns one session (the most recent)
            const statusQuery = `
        SELECT SessionID, UID, login_time, is_online
        FROM UserSession
        WHERE UID = ? AND is_online = 1
        ORDER BY login_time DESC
        LIMIT 1
      `;

            // Execute the query with parameters
            const [rows] = await connection.execute(statusQuery, [UID]);

            // Release connection back to pool
            connection.release();

            // Determine if user is online based on query results
            // If rows.length > 0, user has an active session
            const isOnline = rows.length > 0 ? true : false;

            // If user is offline, session will be null
            // If user is online, session will contain the active session record
            const session = rows.length > 0 ? rows[0] : null;

            // Return session status
            return res.status(200).json({
                success: true,
                isOnline: isOnline,
                session: session
            });

        } catch (queryError) {
            // Database query execution failed
            connection.release();
            console.error('Session status query error:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to fetch session status'
            });
        }

    } catch (error) {
        // Unexpected server error
        console.error('Get session status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Get User Sessions Function
 * Retrieves all sessions for a specific user (up to 50 most recent)
 * Useful for showing session history, activity audits, and device management
 *
 * Expected URL parameter:
 * /api/session/history/:UID
 *
 * Response:
 * {
 *   success: true,
 *   sessions: [
 *     {
 *       SessionID: number,
 *       UID: number,
 *       login_time: timestamp,
 *       logout_time: timestamp or null,
 *       ip_address: string,
 *       user_agent: string,
 *       is_online: boolean
 *     }
 *   ]
 * }
 */
exports.getUserSessions = async (req, res) => {
    try {
        // Get UID from URL parameter
        const { UID } = req.params;

        // Validate input - UID is required
        if (!UID) {
            return res.status(400).json({
                success: false,
                message: 'UID is required'
            });
        }

        // Get database connection from pool
        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            // Database connection failed
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // SQL query to get all sessions for a user
            // Includes all columns: SessionID, login_time, logout_time, IP, user agent, status
            // ORDER BY login_time DESC: Most recent sessions first
            // LIMIT 50: Returns maximum 50 sessions (prevents loading too much data)
            const sessionsQuery = `
        SELECT SessionID, UID, login_time, logout_time, ip_address, user_agent, is_online
        FROM UserSession
        WHERE UID = ?
        ORDER BY login_time DESC
        LIMIT 50
      `;

            // Execute the query with parameters
            const [rows] = await connection.execute(sessionsQuery, [UID]);

            // Release connection back to pool
            connection.release();

            // Return all sessions found for user
            return res.status(200).json({
                success: true,
                sessions: rows
            });

        } catch (queryError) {
            // Database query execution failed
            connection.release();
            console.error('User sessions query error:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to fetch user sessions'
            });
        }

    } catch (error) {
        // Unexpected server error
        console.error('Get user sessions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
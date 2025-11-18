// File: backend/src/routes/sessionRoutes.js
// Purpose: Defines all session-related API endpoints
// Routes: logout, session status, session history

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

/**
 * POST /api/session/logout
 * Records user logout in the database
 * Updates the session record with logout_time and sets is_online to 0
 *
 * Request body required:
 * {
 *   sessionID: number (from login response),
 *   UID: number (user ID)
 * }
 *
 * Response:
 * {
 *   success: true/false,
 *   message: "Logout successful" or error message,
 *   sessionID: number
 * }
 *
 * Usage in frontend:
 * axios.post('/api/session/logout', {
 *   sessionID: sessionID,
 *   UID: userData.UID
 * })
 */
router.post('/logout', sessionController.logout);

/**
 * GET /api/session/status/:UID
 * Checks the current session status for a user
 * Returns whether user is currently online and their active session info
 *
 * URL parameter:
 * UID - The user ID to check status for
 *
 * Response:
 * {
 *   success: true/false,
 *   isOnline: boolean (true if user has active session),
 *   session: {
 *     SessionID: number,
 *     UID: number,
 *     login_time: timestamp,
 *     is_online: 1
 *   } or null if offline
 * }
 *
 * Usage in frontend:
 * axios.get(`/api/session/status/${userID}`)
 *   .then(response => {
 *     console.log('User is online:', response.data.isOnline);
 *   })
 */
router.get('/status/:UID', sessionController.getSessionStatus);

/**
 * GET /api/session/history/:UID
 * Retrieves session history for a user
 * Shows all login/logout events with IP address and device info
 * Limited to most recent 50 sessions
 *
 * URL parameter:
 * UID - The user ID to get history for
 *
 * Response:
 * {
 *   success: true/false,
 *   sessions: [
 *     {
 *       SessionID: number,
 *       UID: number,
 *       login_time: timestamp,
 *       logout_time: timestamp or null,
 *       ip_address: string,
 *       user_agent: string,
 *       is_online: 0 or 1
 *     },
 *     ... more sessions
 *   ]
 * }
 *
 * Usage in frontend:
 * axios.get(`/api/session/history/${userID}`)
 *   .then(response => {
 *     response.data.sessions.forEach(session => {
 *       console.log(`Login: ${session.login_time}, Logout: ${session.logout_time}`);
 *     });
 *   })
 *
 * Use cases:
 * - Display "Active Sessions" in user account settings
 * - Show login history for security audits
 * - Implement "Logout all other devices" feature
 * - Detect unauthorized access (unfamiliar IP address or device)
 */
router.get('/history/:UID', sessionController.getUserSessions);

module.exports = router;
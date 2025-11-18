// File: frontend/src/services/authService.js
// Purpose: Handles authentication including login, logout with session tracking
// Updated to integrate with UserSession table for tracking user status

import axios from 'axios';

// Get API URL from environment variables (.env file)
const API_URL = import.meta.env.VITE_API_URL;

const authService = {
  /**
   * Login Function
   * Authenticates user and creates a session record in the database
   * Stores sessionID and user data in localStorage for future use
   *
   * @param {string} identifier - Email or UID of user
   * @param {string} password - User's password
   *
   * @returns {Promise<Object>} Response object containing:
   *   {
   *     success: boolean,
   *     message: string,
   *     sessionID: number or null,
   *     user: { UID, name, email }
   *   }
   *
   * Usage:
   * const result = await authService.login('alice.johnson@email.com', 'password123');
   * if (result.success) {
   *   // User is logged in
   * }
   */
  login: async (identifier, password) => {
    try {
      // Send login request to backend API
      // Backend checks password and creates session record
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier: identifier,
        password: password
      });

      // Check if login was successful
      if (response.data.success) {
        // Store sessionID in localStorage for logout tracking
        // This ID links this browser session to the database record
        if (response.data.sessionID) {
          localStorage.setItem('sessionID', response.data.sessionID);
        }

        // Store user data in localStorage for future use
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('isLoggedIn', 'true');
        }
      }

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Handle various error types
      if (error.response) {
        // Server responded with an error status code
        return error.response.data;
      } else if (error.request) {
        // Request made but no response received
        return {
          success: false,
          message: 'Unable to connect to the database'
        };
      } else {
        // Error setting up the request
        return {
          success: false,
          message: error.message
        };
      }
    }
  },

  /**
   * Logout Function
   * Updates the session record in database with logout time
   * Clears all user data from local storage
   *
   * Steps:
   * 1. Retrieves sessionID and UID from localStorage
   * 2. Sends logout request to backend API
   * 3. Backend updates session record (sets logout_time, is_online=0)
   * 4. Clears all user data from localStorage
   *
   * @returns {Promise<void>}
   *
   * Usage:
   * await authService.logout();
   * // User is now logged out and session is recorded
   *
   * Note:
   * - Logout succeeds even if database update fails
   * - Frontend logout is guaranteed even if backend unavailable
   * - Error is logged but doesn't prevent logout
   */
  logout: async () => {
    try {
      // Get session information from localStorage
      // sessionID: Auto-assigned ID from login, links to database session record
      // user: Contains UID needed for logout verification
      const sessionID = localStorage.getItem('sessionID');
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;

      // Only make logout API call if we have both session tracking info
      // This handles case where login might not have created a session
      if (sessionID && userData && userData.UID) {
        try {
          // Send logout request to backend
          // Backend will update the session record with logout_time
          // and set is_online flag to 0
          await axios.post(`${API_URL}/session/logout`, {
            sessionID: sessionID,
            UID: userData.UID
          });
        } catch (logoutError) {
          // Log error but don't prevent frontend logout
          // Session might have already been recorded
          console.error('Logout API error:', logoutError);
        }
      }

      // Clear all user data from localStorage
      // This happens regardless of whether API call succeeded
      // Ensures user is logged out on frontend even if backend unavailable
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('sessionID');

    } catch (error) {
      // Unexpected error during logout
      console.error('Logout error:', error);

      // Still clear localStorage even if error occurs
      // This ensures user is logged out on frontend
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('sessionID');
    }
  },

  /**
   * Get Current User
   * Retrieves user data from localStorage
   *
   * @returns {Object|null} User object with UID, name, email or null if not logged in
   *
   * Usage:
   * const user = authService.getCurrentUser();
   * if (user) {
   *   console.log('Logged in as:', user.name);
   * }
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check Login Status
   * Checks if user is currently logged in
   *
   * @returns {boolean} True if user is logged in, false otherwise
   *
   * Usage:
   * if (authService.isLoggedIn()) {
   *   // Show dashboard
   * } else {
   *   // Show login form
   * }
   */
  isLoggedIn: () => {
    return localStorage.getItem('isLoggedIn') === 'true';
  },

  /**
   * Get Current Session Status
   * Checks if user is currently online in the database
   * Useful for showing online/offline indicators
   *
   * @param {number} UID - User ID to check status for
   *
   * @returns {Promise<Object>} Status object containing:
   *   {
   *     success: boolean,
   *     isOnline: boolean,
   *     session: { SessionID, UID, login_time, is_online } or null
   *   }
   *
   * Usage:
   * const status = await authService.getSessionStatus(userID);
   * if (status.isOnline) {
   *   // Show user as online
   * }
   */
  getSessionStatus: async (UID) => {
    try {
      // Query backend for user's current session status
      const response = await axios.get(`${API_URL}/session/status/${UID}`);
      return response.data;
    } catch (error) {
      // If API fails, assume user is offline
      console.error('Get session status error:', error);
      return {
        success: false,
        isOnline: false
      };
    }
  },

  /**
   * Get Session History
   * Retrieves all login/logout sessions for a user
   * Shows device, IP, and timestamp information
   *
   * @param {number} UID - User ID to get history for
   *
   * @returns {Promise<Object>} History object containing:
   *   {
   *     success: boolean,
   *     sessions: [
   *       {
   *         SessionID: number,
   *         UID: number,
   *         login_time: timestamp,
   *         logout_time: timestamp or null,
   *         ip_address: string,
   *         user_agent: string,
   *         is_online: 0 or 1
   *       }
   *     ]
   *   }
   *
   * Usage in Vue component:
   * const history = await authService.getSessionHistory(userID);
   * // Display in template to show active devices
   * <div v-for="session in history.sessions" :key="session.SessionID">
   *   <p>{{ session.login_time }}</p>
   *   <p>{{ session.ip_address }}</p>
   * </div>
   *
   * Use cases:
   * - Display "Active Sessions" tab in account settings
   * - Show security alerts for new login locations
   * - Implement "Logout all other devices" button
   * - Activity log and audit trail
   */
  getSessionHistory: async (UID) => {
    try {
      // Query backend for complete session history
      const response = await axios.get(`${API_URL}/session/history/${UID}`);
      return response.data;
    } catch (error) {
      // If API fails, return empty history
      console.error('Get session history error:', error);
      return {
        success: false,
        sessions: []
      };
    }
  }
};

export default authService;

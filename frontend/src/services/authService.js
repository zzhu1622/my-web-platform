import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const authService = {
  // Login function
  login: async (identifier, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier: identifier,
        password: password
      });

      // Return response data
      return response.data;

    } catch (error) {
      // Handle error
      if (error.response) {
        // Server responded with error status
        return error.response.data;
      } else if (error.request) {
        // Request made but no response
        return {
          success: false,
          message: 'Unable to connect to the database'
        };
      } else {
        // Error in request setup
        return {
          success: false,
          message: error.message
        };
      }
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
};

export default authService;

import axios from 'axios';

// Configure API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const listingService = {
  // Fetch all active product listings from database
  getAllListings: async () => {
    try {
      const response = await axios.get(`${API_URL}/listings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching listings:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch listings',
        data: []
      };
    }
  },

  // Fetch specific listing details by listing ID
  getListingById: async (listingId) => {
    try {
      const response = await axios.get(`${API_URL}/listings/${listingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching listing details:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch listing details'
      };
    }
  },

  // Fetch all listings posted by a specific seller
  getUserListings: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/listings/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user listings:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user listings',
        data: []
      };
    }
  }
};

export default listingService;

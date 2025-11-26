import axios from 'axios';

// Configure API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const listingService = {
  // Fetch all active product listings from database with optional search and filter parameters
  // Parameters:
  // - searchKeyword: string to search in item titles (partial match)
  // - category: filter by specific category
  // - sortBy: field to sort by (price or expire_date)
  // - sortOrder: sort direction (asc or desc)
  getAllListings: async (params = {}) => {
    try {
      // Build query string from params object
      // Only include parameters that have values
      const queryParams = new URLSearchParams();

      if (params.searchKeyword) {
        queryParams.append('searchKeyword', params.searchKeyword);
      }

      if (params.category) {
        queryParams.append('category', params.category);
      }

      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }

      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }

      // Construct final URL with query string
      const url = `${API_URL}/listings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      console.log('Fetching listings with URL:', url);

      const response = await axios.get(url);
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

  // Fetch all unique categories from the database
  // Used to populate category filter dropdown
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/listings/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch categories',
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

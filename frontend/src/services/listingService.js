import axios from 'axios';

// Configure API base URL from environment variables
// Falls back to localhost if environment variable is not set
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
  // Returns complete listing information including media, seller info, and descriptions
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
  // Used for seller's own listings management
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
  },

  // Create a new listing with item data and media files
  // Uses FormData for multipart/form-data submission to handle file uploads
  // Parameters:
  // - formData: FormData object containing:
  //   - user_id: seller's UID
  //   - title: item title
  //   - category: item category
  //   - condition: item condition (like_new, good, fair, poor)
  //   - description: item description
  //   - selling_price: asking price
  //   - original_price: optional original price
  //   - expire_date: listing expiration date
  //   - condition_details: optional condition details
  //   - images: array of image files
  //   - video: optional video file
  createListing: async (formData) => {
    try {
      // Send POST request with FormData
      // axios automatically sets Content-Type to multipart/form-data for FormData
      const response = await axios.post(`${API_URL}/listings/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create listing';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Fetch price reference data for similar sold items
  // Used to help sellers set appropriate prices based on market data
  // Parameters:
  // - category: item category to match
  // - condition: item condition to match
  // Returns: array of similar sold items with prices (privacy-safe)
  getPriceReference: async (category, condition) => {
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      queryParams.append('category', category);
      queryParams.append('condition', condition);

      const response = await axios.get(`${API_URL}/listings/price-reference?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price reference:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch price reference',
        data: []
      };
    }
  }
};

export default listingService;

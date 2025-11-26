import axios from 'axios';

// Get API base URL from environment variables
// This allows different URLs for development and production
const API_URL = import.meta.env.VITE_API_URL;

// Review Service Module
// Provides functions for review-related API communications
// Handles all HTTP requests to the backend review endpoints
const reviewService = {

  // =====================================================
  // CREATE REVIEW
  // =====================================================
  // Purpose: Submit a review for a completed order
  // Parameters:
  //   - order_id: ID of the order being reviewed
  //   - user_uid: ID of the buyer (current user)
  //   - rating: Rating from 1 to 5 (required)
  //   - comment: Text comment (optional, max 2000 chars)
  // Returns: Promise resolving to response data
  //   { success: boolean, review_id: number, message: string, review: object }
  // Error Handling: Returns error response with success: false
  createReview: async (order_id, user_uid, rating, comment = null) => {
    try {
      // Prepare request payload
      const requestData = {
        order_id: order_id,
        user_uid: user_uid,
        rating: rating
      };

      // Include comment only if provided and not empty
      if (comment && comment.trim()) {
        requestData.comment = comment.trim();
      }

      // Send POST request to create review endpoint
      const response = await axios.post(`${API_URL}/reviews/create`, requestData);

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error creating review:', error);

      // Extract error message from response if available
      // Otherwise use generic error message
      const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // =====================================================
  // GET REVIEW BY ORDER ID
  // =====================================================
  // Purpose: Fetch the review for a specific order (if exists)
  // Parameters:
  //   - order_id: ID of the order
  //   - user_uid: ID of the requesting user (optional, for authorization)
  // Returns: Promise resolving to response data
  //   { success: boolean, has_review: boolean, review: object | null }
  // Error Handling: Returns error response with success: false
  getReviewByOrderId: async (order_id, user_uid = null) => {
    try {
      // Build query parameters
      const params = {};
      if (user_uid) {
        params.user_uid = user_uid;
      }

      // Send GET request to get review endpoint
      const response = await axios.get(`${API_URL}/reviews/order/${order_id}`, { params });

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error fetching review:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch review. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage,
        has_review: false,
        review: null
      };
    }
  },

  // =====================================================
  // GET SELLER REVIEWS
  // =====================================================
  // Purpose: Fetch all reviews for a seller's completed orders
  // Parameters:
  //   - seller_uid: ID of the seller
  // Returns: Promise resolving to response data
  //   { success: boolean, reviews: array, count: number, average_rating: number }
  // Error Handling: Returns error response with success: false
  getSellerReviews: async (seller_uid) => {
    try {
      // Send GET request to get seller reviews endpoint
      const response = await axios.get(`${API_URL}/reviews/seller/${seller_uid}`);

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error fetching seller reviews:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch seller reviews. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage,
        reviews: [],
        count: 0,
        average_rating: 0
      };
    }
  }
};

export default reviewService;

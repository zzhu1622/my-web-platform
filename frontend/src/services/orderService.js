import axios from 'axios';

// Get API base URL from environment variables
// This allows different URLs for development and production
const API_URL = import.meta.env.VITE_API_URL;

// Order Service Module
// Provides functions for order-related API communications
// Handles all HTTP requests to the backend order endpoints
const orderService = {

  // =====================================================
  // CREATE ORDER
  // =====================================================
  // Purpose: Submit a new order to purchase a listing
  // Parameters:
  //   - listing_id: ID of the listing to purchase
  //   - buyer_uid: ID of the buyer (current user)
  //   - delivery_method: Selected delivery method
  //   - delivery_note: Optional delivery instructions (required if method is "Other")
  // Returns: Promise resolving to response data
  //   { success: boolean, order_id: number, message: string, order_details: object }
  // Error Handling: Returns error response with success: false
  createOrder: async (listing_id, buyer_uid, delivery_method, delivery_note = null) => {
    try {
      // Prepare request payload
      const requestData = {
        listing_id: listing_id,
        buyer_uid: buyer_uid,
        delivery_method: delivery_method
      };

      // Include delivery note only if provided
      if (delivery_note) {
        requestData.delivery_note = delivery_note;
      }

      // Send POST request to create order endpoint
      const response = await axios.post(`${API_URL}/orders/create`, requestData);

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error creating order:', error);

      // Extract error message from response if available
      // Otherwise use generic error message
      const errorMessage = error.response?.data?.message || 'Failed to create order. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // =====================================================
  // GET BUYER ORDERS
  // =====================================================
  // Purpose: Fetch all orders placed by a specific buyer
  // Parameters:
  //   - buyer_uid: ID of the buyer (current user)
  // Returns: Promise resolving to response data
  //   { success: boolean, orders: array, count: number }
  // Error Handling: Returns error response with success: false
  getBuyerOrders: async (buyer_uid) => {
    try {
      // Send GET request to buyer orders endpoint
      const response = await axios.get(`${API_URL}/orders/buyer/${buyer_uid}`);

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error fetching buyer orders:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage,
        orders: [],
        count: 0
      };
    }
  },

  // =====================================================
  // GET SELLER ORDERS
  // =====================================================
  // Purpose: Fetch all orders for items sold by a specific seller
  // Parameters:
  //   - seller_uid: ID of the seller (current user)
  // Returns: Promise resolving to response data
  //   { success: boolean, orders: array, count: number }
  // Error Handling: Returns error response with success: false
  getSellerOrders: async (seller_uid) => {
    try {
      // Send GET request to seller orders endpoint
      const response = await axios.get(`${API_URL}/orders/seller/${seller_uid}`);

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error fetching seller orders:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage,
        orders: [],
        count: 0
      };
    }
  },

  // =====================================================
  // GET ORDER BY ID
  // =====================================================
  // Purpose: Fetch details of a specific order
  // Parameters:
  //   - order_id: ID of the order
  //   - user_uid: ID of the requesting user (for authorization)
  // Returns: Promise resolving to response data
  //   { success: boolean, order: object }
  // Error Handling: Returns error response with success: false
  getOrderById: async (order_id, user_uid) => {
    try {
      // Send GET request with user_uid as query parameter for authorization
      const response = await axios.get(`${API_URL}/orders/${order_id}`, {
        params: {
          user_uid: user_uid
        }
      });

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error fetching order details:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch order details. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // =====================================================
  // COMPLETE ORDER
  // =====================================================
  // Purpose: Mark an order as completed (seller marks delivery)
  // Parameters:
  //   - order_id: ID of the order to complete
  //   - user_uid: ID of the seller (for authorization)
  // Returns: Promise resolving to response data
  //   { success: boolean, message: string }
  // Error Handling: Returns error response with success: false
  completeOrder: async (order_id, user_uid) => {
    try {
      // Send POST request to complete order endpoint
      const response = await axios.post(`${API_URL}/orders/${order_id}/complete`, {
        user_uid: user_uid
      });

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error completing order:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to complete order. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // =====================================================
  // REQUEST CANCEL ORDER
  // =====================================================
  // Purpose: Request cancellation of an order (buyer or seller)
  // Parameters:
  //   - order_id: ID of the order to cancel
  //   - user_uid: ID of the user requesting cancellation
  // Returns: Promise resolving to response data
  //   { success: boolean, message: string }
  // Error Handling: Returns error response with success: false
  requestCancelOrder: async (order_id, user_uid) => {
    try {
      // Send POST request to request cancellation endpoint
      const response = await axios.post(`${API_URL}/orders/${order_id}/cancel/request`, {
        user_uid: user_uid
      });

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error requesting order cancellation:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to request cancellation. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // =====================================================
  // ACCEPT CANCEL ORDER
  // =====================================================
  // Purpose: Accept a cancellation request from the other party
  // Parameters:
  //   - order_id: ID of the order
  //   - user_uid: ID of the user accepting cancellation
  // Returns: Promise resolving to response data
  //   { success: boolean, message: string }
  // Error Handling: Returns error response with success: false
  acceptCancelOrder: async (order_id, user_uid) => {
    try {
      // Send POST request to accept cancellation endpoint
      const response = await axios.post(`${API_URL}/orders/${order_id}/cancel/accept`, {
        user_uid: user_uid
      });

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error accepting order cancellation:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to accept cancellation. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // =====================================================
  // REJECT CANCEL ORDER
  // =====================================================
  // Purpose: Reject a cancellation request from the other party
  // Parameters:
  //   - order_id: ID of the order
  //   - user_uid: ID of the user rejecting cancellation
  // Returns: Promise resolving to response data
  //   { success: boolean, message: string }
  // Error Handling: Returns error response with success: false
  rejectCancelOrder: async (order_id, user_uid) => {
    try {
      // Send POST request to reject cancellation endpoint
      const response = await axios.post(`${API_URL}/orders/${order_id}/cancel/reject`, {
        user_uid: user_uid
      });

      // Return response data to caller
      return response.data;

    } catch (error) {
      // Log error for debugging purposes
      console.error('Error rejecting order cancellation:', error);

      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 'Failed to reject cancellation. Please try again.';

      // Return standardized error response
      return {
        success: false,
        message: errorMessage
      };
    }
  }
};

export default orderService;

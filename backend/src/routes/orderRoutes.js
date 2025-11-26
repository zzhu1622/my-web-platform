const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order Routes Module
// Defines all API endpoints related to order operations
// All routes are prefixed with /api/orders in the main server file

// =====================================================
// CREATE ORDER ROUTE
// =====================================================
// Endpoint: POST /api/orders/create
// Purpose: Create a new order and reserve the listing
// Authentication: Required (buyer must be logged in)
// Request Body:
//   {
//     listing_id: number,
//     buyer_uid: number,
//     delivery_method: string,
//     delivery_note: string (optional, required if delivery_method is "Other methods")
//   }
// Response: { success: boolean, order_id: number, message: string, order_details: object }
router.post('/create', orderController.createOrder);

// =====================================================
// GET BUYER ORDERS ROUTE
// =====================================================
// Endpoint: GET /api/orders/buyer/:buyer_uid
// Purpose: Retrieve all orders placed by a specific buyer
// Authentication: Required (user must be logged in)
// URL Parameters: buyer_uid - ID of the buyer
// Response: { success: boolean, orders: array, count: number }
router.get('/buyer/:buyer_uid', orderController.getUserOrders);

// =====================================================
// GET SELLER ORDERS ROUTE
// =====================================================
// Endpoint: GET /api/orders/seller/:seller_uid
// Purpose: Retrieve all orders for items sold by a specific seller
// Authentication: Required (user must be logged in)
// URL Parameters: seller_uid - ID of the seller
// Response: { success: boolean, orders: array, count: number }
router.get('/seller/:seller_uid', orderController.getSellerOrders);

// =====================================================
// GET ORDER BY ID ROUTE
// =====================================================
// Endpoint: GET /api/orders/:order_id
// Purpose: Retrieve details of a specific order
// Authentication: Required (only buyer or seller can access)
// URL Parameters: order_id - ID of the order
// Query Parameters: user_uid - ID of requesting user (for authorization)
// Response: { success: boolean, order: object }
router.get('/:order_id', orderController.getOrderById);

module.exports = router;

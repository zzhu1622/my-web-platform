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

// =====================================================
// COMPLETE ORDER ROUTE
// =====================================================
// Endpoint: POST /api/orders/:order_id/complete
// Purpose: Mark an order as completed (seller marks delivery)
// Authentication: Required (only seller can complete)
// URL Parameters: order_id - ID of the order
// Request Body: { user_uid: number }
// Response: { success: boolean, message: string }
// Status Transition: PENDING -> COMPLETED
// Side Effects:
//   - Item status: reserved -> Sold
//   - Listing status: reserved -> Sold
router.post('/:order_id/complete', orderController.completeOrder);

// =====================================================
// REQUEST CANCEL ORDER ROUTE
// =====================================================
// Endpoint: POST /api/orders/:order_id/cancel/request
// Purpose: Request cancellation of an order (buyer or seller can request)
// Authentication: Required (buyer or seller)
// URL Parameters: order_id - ID of the order
// Request Body: { user_uid: number }
// Response: { success: boolean, message: string }
// Status Transitions:
//   - If buyer requests: PENDING -> CANCEL_REQUESTED_BY_BUYER
//   - If seller requests: PENDING -> CANCEL_REQUESTED_BY_SELLER
// Note: Item and Listing remain in 'reserved' status until cancellation is accepted
router.post('/:order_id/cancel/request', orderController.requestCancelOrder);

// =====================================================
// ACCEPT CANCEL ORDER ROUTE
// =====================================================
// Endpoint: POST /api/orders/:order_id/cancel/accept
// Purpose: Accept a cancellation request from the other party
// Authentication: Required (the OTHER party must accept)
// URL Parameters: order_id - ID of the order
// Request Body: { user_uid: number }
// Response: { success: boolean, message: string }
// Status Transitions:
//   - If seller accepts buyer request: CANCEL_REQUESTED_BY_BUYER -> CANCELLED_BY_BUYER
//   - If buyer accepts seller request: CANCEL_REQUESTED_BY_SELLER -> CANCELLED_BY_SELLER
// Side Effects:
//   - Item status: reserved -> available
//   - Listing status: reserved -> active
router.post('/:order_id/cancel/accept', orderController.acceptCancelOrder);

// =====================================================
// REJECT CANCEL ORDER ROUTE
// =====================================================
// Endpoint: POST /api/orders/:order_id/cancel/reject
// Purpose: Reject a cancellation request from the other party
// Authentication: Required (the OTHER party must reject)
// URL Parameters: order_id - ID of the order
// Request Body: { user_uid: number }
// Response: { success: boolean, message: string }
// Status Transitions:
//   - If seller rejects buyer request: CANCEL_REQUESTED_BY_BUYER -> CANCEL_REJECTED_BY_SELLER
//   - If buyer rejects seller request: CANCEL_REQUESTED_BY_SELLER -> CANCEL_REJECTED_BY_BUYER
// Note: Item and Listing remain in 'reserved' status
router.post('/:order_id/cancel/reject', orderController.rejectCancelOrder);

module.exports = router;
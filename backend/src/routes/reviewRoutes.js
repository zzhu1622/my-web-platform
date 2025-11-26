const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review Routes Module
// Defines all API endpoints related to review operations
// All routes are prefixed with /api/reviews in the main server file

// =====================================================
// CREATE REVIEW ROUTE
// =====================================================
// Endpoint: POST /api/reviews/create
// Purpose: Submit a review for a completed order
// Authentication: Required (buyer must be logged in)
// Request Body:
//   {
//     order_id: number,      // Required: ID of the order being reviewed
//     user_uid: number,      // Required: ID of the buyer (from session)
//     rating: number,        // Required: Rating from 1 to 5
//     comment: string        // Optional: Text comment (max 2000 chars)
//   }
// Response: { success: boolean, review_id: number, message: string, review: object }
// Validation:
//   - User must be the buyer of the order (Order.UID == user_uid)
//   - Order status must be COMPLETED
//   - No existing review for this order (one-time submission)
//   - Rating must be integer 1-5
router.post('/create', reviewController.createReview);

// =====================================================
// GET REVIEW BY ORDER ID ROUTE
// =====================================================
// Endpoint: GET /api/reviews/order/:order_id
// Purpose: Retrieve the review for a specific order (if exists)
// Authentication: Required (buyer or seller can view)
// URL Parameters: order_id - ID of the order
// Query Parameters: user_uid - ID of requesting user (optional, for authorization)
// Response:
//   If review exists: { success: true, has_review: true, review: object }
//   If no review: { success: true, has_review: false, review: null }
router.get('/order/:order_id', reviewController.getReviewByOrderId);

// =====================================================
// GET SELLER REVIEWS ROUTE
// =====================================================
// Endpoint: GET /api/reviews/seller/:seller_uid
// Purpose: Retrieve all reviews for a seller's completed orders
// Authentication: Public (anyone can view seller ratings)
// URL Parameters: seller_uid - ID of the seller
// Response: { success: boolean, reviews: array, count: number, average_rating: number }
router.get('/seller/:seller_uid', reviewController.getSellerReviews);

module.exports = router;

const pool = require('../config/database');

// Review Controller Module
// Handles all review-related operations: creation and retrieval
// Reviews can only be created by buyers for COMPLETED orders
// Once submitted, reviews cannot be modified or deleted by users
const reviewController = {

    // =====================================================
    // CREATE REVIEW
    // =====================================================
    // HTTP: POST /api/reviews/create
    // Purpose: Submit a review for a completed order
    // Request Body:
    //   {
    //     order_id: number,       // Required: ID of the order being reviewed
    //     user_uid: number,       // Required: ID of the buyer (from session)
    //     rating: number,         // Required: Rating from 1 to 5
    //     comment: string         // Optional: Text comment (max 2000 chars)
    //   }
    // Response:
    //   Success: { success: true, review_id: number, message: string, review: object }
    //   Error: { success: false, message: string }
    // Validation Rules:
    //   1. User must be the buyer of the order (Order.UID == user_uid)
    //   2. Order status must be COMPLETED
    //   3. No existing review for this order (one-time submission)
    //   4. Rating must be integer 1-5
    createReview: async (req, res) => {
        const { order_id, user_uid, rating, comment } = req.body;

        // Input validation: check required fields
        if (!order_id || !user_uid || rating === undefined || rating === null) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: order_id, user_uid, and rating are required'
            });
        }

        // Validate rating is integer between 1 and 5
        const ratingInt = parseInt(rating);
        if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be an integer between 1 and 5'
            });
        }

        // Validate comment length if provided
        if (comment && comment.length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Comment must not exceed 2000 characters'
            });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Step 1: Lock and fetch order to validate ownership and status
            // Using FOR UPDATE to prevent race conditions (double-submit)
            const [orderRows] = await connection.execute(
                `SELECT o.OrderID, o.UID as buyer_uid, o.status as order_status
                 FROM \`Order\` o
                 WHERE o.OrderID = ?
                 FOR UPDATE`,
                [order_id]
            );

            if (orderRows.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            const orderData = orderRows[0];

            // Step 2: Verify user is the buyer of this order
            if (orderData.buyer_uid !== parseInt(user_uid)) {
                await connection.rollback();
                connection.release();
                return res.status(403).json({
                    success: false,
                    message: 'Only the buyer can submit a review for this order'
                });
            }

            // Step 3: Verify order status is COMPLETED
            if (orderData.order_status !== 'COMPLETED') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Only completed orders can be reviewed. Current status: ' + (orderData.order_status || 'PENDING')
                });
            }

            // Step 4: Check if review already exists for this order (one-time submission rule)
            const [existingReview] = await connection.execute(
                `SELECT ReviewID FROM Review WHERE OrderID = ? LIMIT 1`,
                [order_id]
            );

            if (existingReview.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'A review has already been submitted for this order. Reviews cannot be modified.'
                });
            }

            // Step 5: Insert the review
            // review_date will be auto-filled by DEFAULT CURRENT_TIMESTAMP
            const [reviewResult] = await connection.execute(
                `INSERT INTO Review (UID, OrderID, rating, comment)
                 VALUES (?, ?, ?, ?)`,
                [user_uid, order_id, ratingInt, comment || null]
            );

            const review_id = reviewResult.insertId;

            await connection.commit();
            connection.release();

            console.log(`Review ${review_id} created for order ${order_id} by user ${user_uid}`);

            return res.status(201).json({
                success: true,
                review_id: review_id,
                message: 'Review submitted successfully. Thank you for your feedback!',
                review: {
                    review_id: review_id,
                    order_id: order_id,
                    rating: ratingInt,
                    comment: comment || null
                }
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error('Error creating review:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to submit review',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET REVIEW BY ORDER ID
    // =====================================================
    // HTTP: GET /api/reviews/order/:order_id
    // Purpose: Retrieve the review for a specific order (if exists)
    // URL Parameters: order_id - ID of the order
    // Query Parameters: user_uid - ID of requesting user (optional, for authorization)
    // Response:
    //   If review exists: { success: true, has_review: true, review: object }
    //   If no review: { success: true, has_review: false, review: null }
    // Authorization: Only buyer or seller of the order can view the review
    getReviewByOrderId: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { user_uid } = req.query;

            if (!order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const connection = await pool.getConnection();

            try {
                // First verify the user has access to this order (is buyer or seller)
                const [orderRows] = await connection.execute(
                    `SELECT o.UID as buyer_uid, l.UID as seller_uid
                     FROM \`Order\` o
                     INNER JOIN Listing l ON o.ListID = l.ListID
                     WHERE o.OrderID = ?`,
                    [order_id]
                );

                if (orderRows.length === 0) {
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Order not found'
                    });
                }

                const orderData = orderRows[0];

                // Optional: Check authorization if user_uid provided
                if (user_uid) {
                    const uid = parseInt(user_uid);
                    if (orderData.buyer_uid !== uid && orderData.seller_uid !== uid) {
                        connection.release();
                        return res.status(403).json({
                            success: false,
                            message: 'You are not authorized to view this review'
                        });
                    }
                }

                // Fetch the review with reviewer (buyer) info
                const [reviewRows] = await connection.execute(
                    `SELECT r.ReviewID, r.UID as reviewer_uid, r.OrderID, r.rating, r.comment, r.review_date,
                            u.name as reviewer_name
                     FROM Review r
                     INNER JOIN User u ON r.UID = u.UID
                     WHERE r.OrderID = ?`,
                    [order_id]
                );

                connection.release();

                if (reviewRows.length === 0) {
                    return res.status(200).json({
                        success: true,
                        has_review: false,
                        review: null
                    });
                }

                const reviewData = reviewRows[0];

                return res.status(200).json({
                    success: true,
                    has_review: true,
                    review: {
                        review_id: reviewData.ReviewID,
                        order_id: reviewData.OrderID,
                        rating: reviewData.rating,
                        comment: reviewData.comment,
                        review_date: reviewData.review_date,
                        reviewer: {
                            uid: reviewData.reviewer_uid,
                            name: reviewData.reviewer_name
                        }
                    }
                });

            } catch (queryError) {
                connection.release();
                throw queryError;
            }

        } catch (error) {
            console.error('Error fetching review:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch review',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET SELLER REVIEWS
    // =====================================================
    // HTTP: GET /api/reviews/seller/:seller_uid
    // Purpose: Retrieve all reviews for a seller's completed orders
    // URL Parameters: seller_uid - ID of the seller
    // Response: { success: true, reviews: array, count: number, average_rating: number }
    // Note: This endpoint is public (anyone can view seller ratings)
    getSellerReviews: async (req, res) => {
        try {
            const { seller_uid } = req.params;

            if (!seller_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Seller UID is required'
                });
            }

            const connection = await pool.getConnection();

            try {
                // Fetch all reviews for orders on seller's listings
                // Joins: Review -> Order -> Listing (where Listing.UID = seller_uid)
                const query = `
                    SELECT 
                        r.ReviewID,
                        r.OrderID,
                        r.rating,
                        r.comment,
                        r.review_date,
                        r.UID as reviewer_uid,
                        buyer.name as reviewer_name,
                        i.title as item_title,
                        o.price
                    FROM Review r
                    INNER JOIN \`Order\` o ON r.OrderID = o.OrderID
                    INNER JOIN Listing l ON o.ListID = l.ListID
                    INNER JOIN Item i ON l.ItemID = i.ItemID
                    INNER JOIN User buyer ON r.UID = buyer.UID
                    WHERE l.UID = ?
                    ORDER BY r.review_date DESC
                `;

                const [rows] = await connection.execute(query, [seller_uid]);
                connection.release();

                // Calculate average rating
                let totalRating = 0;
                rows.forEach(row => {
                    totalRating += row.rating;
                });
                const averageRating = rows.length > 0 ? (totalRating / rows.length).toFixed(1) : 0;

                // Format response
                const reviews = rows.map(row => ({
                    review_id: row.ReviewID,
                    order_id: row.OrderID,
                    rating: row.rating,
                    comment: row.comment,
                    review_date: row.review_date,
                    reviewer: {
                        uid: row.reviewer_uid,
                        name: row.reviewer_name
                    },
                    item_title: row.item_title,
                    order_price: parseFloat(row.price)
                }));

                return res.status(200).json({
                    success: true,
                    reviews: reviews,
                    count: reviews.length,
                    average_rating: parseFloat(averageRating)
                });

            } catch (queryError) {
                connection.release();
                throw queryError;
            }

        } catch (error) {
            console.error('Error fetching seller reviews:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch seller reviews',
                error: error.message
            });
        }
    }
};

module.exports = reviewController;

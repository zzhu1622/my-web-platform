const pool = require('../config/database');

// Order Controller Module
// Handles all order-related operations: creation, retrieval, status updates
// Implements transaction-based order processing to ensure data consistency
// UPDATED: Now includes review data when fetching orders
const orderController = {

    // =====================================================
    // CREATE ORDER - TRANSACTION-BASED PURCHASE FLOW
    // =====================================================
    // HTTP: POST /api/orders/create
    // Purpose: Create a new order and reserve the listing/item atomically
    // Request Body:
    //   {
    //     listing_id: number,
    //     buyer_uid: number,
    //     delivery_method: string,
    //     delivery_note: string (optional)
    //   }
    // Response: { success: boolean, order_id: number, message: string }
    createOrder: async (req, res) => {
        const { listing_id, buyer_uid, delivery_method, delivery_note } = req.body;

        // Input validation
        if (!listing_id || !buyer_uid || !delivery_method) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: listing_id, buyer_uid, and delivery_method are required'
            });
        }

        // Validate delivery method
        const validDeliveryMethods = [
            'Pick up at the seller door',
            'Delivered to your door',
            'Other methods'
        ];

        if (!validDeliveryMethods.includes(delivery_method)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery method'
            });
        }

        // If "Other methods" selected, delivery_note is required
        if (delivery_method === 'Other methods' && !delivery_note) {
            return res.status(400).json({
                success: false,
                message: 'Delivery instructions are required for "Other methods"'
            });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Step 1: Lock and validate listing
            const [listingRows] = await connection.execute(
                `SELECT l.ListID, l.UID as seller_uid, l.ItemID, l.status as listing_status,
                        i.selling_price, i.status as item_status
                 FROM Listing l
                          INNER JOIN Item i ON l.ItemID = i.ItemID
                 WHERE l.ListID = ?
                     FOR UPDATE`,
                [listing_id]
            );

            if (listingRows.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            const listingData = listingRows[0];

            // Prevent self-purchase
            if (listingData.seller_uid === buyer_uid) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'You cannot purchase your own listing'
                });
            }

            // Check listing status
            if (listingData.listing_status !== 'active') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'This listing is no longer available for purchase'
                });
            }

            // Step 2: Calculate pricing
            const price = parseFloat(listingData.selling_price);
            const tax = price * 0.08;
            const platform_fee = price * 0.05;

            // Step 3: Insert order with PENDING status
            const deliveryValue = delivery_method === 'Other methods'
                ? `${delivery_method}: ${delivery_note}`
                : delivery_method;

            const [orderResult] = await connection.execute(
                `INSERT INTO \`Order\` (UID, ListID, price, tax, platform_fee, delivery_method, status)
                 VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
                [buyer_uid, listing_id, price, tax, platform_fee, deliveryValue]
            );

            const order_id = orderResult.insertId;

            // Step 4: Update Item status to reserved
            await connection.execute(
                `UPDATE Item SET status = 'reserved' WHERE ItemID = ?`,
                [listingData.ItemID]
            );

            // Step 5: Update Listing status to reserved
            await connection.execute(
                `UPDATE Listing SET status = 'reserved' WHERE ListID = ?`,
                [listing_id]
            );

            await connection.commit();
            connection.release();

            return res.status(201).json({
                success: true,
                order_id: order_id,
                message: 'Order created successfully. The item has been reserved for you.',
                order_details: {
                    order_id: order_id,
                    listing_id: listing_id,
                    item_id: listingData.ItemID,
                    price: price,
                    tax: tax,
                    platform_fee: platform_fee,
                    total: (price + tax + platform_fee).toFixed(2),
                    delivery_method: delivery_method,
                    status: 'PENDING'
                }
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error('Error creating order:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create order',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET USER ORDERS (AS BUYER) - WITH REVIEW DATA
    // =====================================================
    // HTTP: GET /api/orders/buyer/:buyer_uid
    // Purpose: Retrieve all orders placed by a buyer with review info
    // UPDATED: Now includes review data for completed orders
    getUserOrders: async (req, res) => {
        try {
            const { buyer_uid } = req.params;

            if (!buyer_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Buyer UID is required'
                });
            }

            const connection = await pool.getConnection();

            try {
                // Query with cover image subquery AND review data
                // LEFT JOIN Review to include orders without reviews
                const query = `
                    SELECT 
                        o.OrderID,
                        o.ListID,
                        o.price,
                        o.tax,
                        o.platform_fee,
                        o.delivery_method,
                        o.status as order_status,
                        o.created_at,
                        l.ItemID,
                        i.title,
                        i.category,
                        i.condition,
                        l.UID as seller_uid,
                        u.name as seller_name,
                        u.email as seller_email,
                        u.phone as seller_phone,
                        i.status as item_status,
                        l.status as listing_status,
                        (
                            SELECT lm.url 
                            FROM ListingMedia lm
                            LEFT JOIN ListingMedia_Image lmi ON lm.MediaID = lmi.MediaID
                            WHERE lm.ListID = l.ListID AND lm.media_type = 'image'
                            ORDER BY lmi.slot ASC, lm.created_at ASC
                            LIMIT 1
                        ) as cover_image,
                        r.ReviewID as review_id,
                        r.rating as review_rating,
                        r.comment as review_comment,
                        r.review_date as review_date
                    FROM \`Order\` o
                    INNER JOIN Listing l ON o.ListID = l.ListID
                    INNER JOIN Item i ON l.ItemID = i.ItemID
                    INNER JOIN User u ON l.UID = u.UID
                    LEFT JOIN Review r ON o.OrderID = r.OrderID
                    WHERE o.UID = ?
                    ORDER BY o.created_at DESC
                `;

                const [rows] = await connection.execute(query, [buyer_uid]);
                connection.release();

                // Format response with review data
                const orders = rows.map(row => {
                    // Build base order object
                    const order = {
                        order_id: row.OrderID,
                        listing_id: row.ListID,
                        item_id: row.ItemID,
                        title: row.title,
                        category: row.category,
                        condition: row.condition,
                        price: parseFloat(row.price),
                        tax: parseFloat(row.tax),
                        platform_fee: parseFloat(row.platform_fee),
                        total: (parseFloat(row.price) + parseFloat(row.tax) + parseFloat(row.platform_fee)).toFixed(2),
                        delivery_method: row.delivery_method,
                        order_status: row.order_status || 'PENDING',
                        seller: {
                            uid: row.seller_uid,
                            name: row.seller_name,
                            email: row.seller_email,
                            phone: row.seller_phone
                        },
                        item_status: row.item_status,
                        listing_status: row.listing_status,
                        cover_image: row.cover_image,
                        created_at: row.created_at,
                        // Review data: null if no review exists
                        has_review: row.review_id !== null,
                        review: row.review_id ? {
                            review_id: row.review_id,
                            rating: row.review_rating,
                            comment: row.review_comment,
                            review_date: row.review_date
                        } : null
                    };
                    return order;
                });

                return res.status(200).json({
                    success: true,
                    orders: orders,
                    count: orders.length
                });

            } catch (queryError) {
                connection.release();
                throw queryError;
            }

        } catch (error) {
            console.error('Error fetching buyer orders:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch orders',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET SELLER ORDERS - WITH REVIEW DATA
    // =====================================================
    // HTTP: GET /api/orders/seller/:seller_uid
    // Purpose: Retrieve all orders for items sold by a seller with review info
    // UPDATED: Now includes review data for completed orders
    getSellerOrders: async (req, res) => {
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
                // Query with cover image subquery AND review data
                // Seller sees buyer reviews on their orders
                const query = `
                    SELECT
                        o.OrderID,
                        o.ListID,
                        o.price,
                        o.tax,
                        o.platform_fee,
                        o.delivery_method,
                        o.status as order_status,
                        o.created_at,
                        l.ItemID,
                        i.title,
                        i.category,
                        i.condition,
                        o.UID as buyer_uid,
                        u.name as buyer_name,
                        u.email as buyer_email,
                        u.phone as buyer_phone,
                        i.status as item_status,
                        l.status as listing_status,
                        (
                            SELECT lm.url
                            FROM ListingMedia lm
                                     LEFT JOIN ListingMedia_Image lmi ON lm.MediaID = lmi.MediaID
                            WHERE lm.ListID = l.ListID AND lm.media_type = 'image'
                            ORDER BY lmi.slot ASC, lm.created_at ASC
                                    LIMIT 1
                        ) as cover_image,
                        r.ReviewID as review_id,
                        r.rating as review_rating,
                        r.comment as review_comment,
                        r.review_date as review_date,
                        reviewer.name as reviewer_name
                    FROM \`Order\` o
                        INNER JOIN Listing l ON o.ListID = l.ListID
                        INNER JOIN Item i ON l.ItemID = i.ItemID
                        INNER JOIN User u ON o.UID = u.UID
                        LEFT JOIN Review r ON o.OrderID = r.OrderID
                        LEFT JOIN User reviewer ON r.UID = reviewer.UID
                    WHERE l.UID = ?
                    ORDER BY o.created_at DESC
                `;

                const [rows] = await connection.execute(query, [seller_uid]);
                connection.release();

                // Format response with review data
                const orders = rows.map(row => {
                    // Build base order object
                    const order = {
                        order_id: row.OrderID,
                        listing_id: row.ListID,
                        item_id: row.ItemID,
                        title: row.title,
                        category: row.category,
                        condition: row.condition,
                        price: parseFloat(row.price),
                        tax: parseFloat(row.tax),
                        platform_fee: parseFloat(row.platform_fee),
                        total: (parseFloat(row.price) + parseFloat(row.tax) + parseFloat(row.platform_fee)).toFixed(2),
                        delivery_method: row.delivery_method,
                        order_status: row.order_status || 'PENDING',
                        buyer: {
                            uid: row.buyer_uid,
                            name: row.buyer_name,
                            email: row.buyer_email,
                            phone: row.buyer_phone
                        },
                        item_status: row.item_status,
                        listing_status: row.listing_status,
                        cover_image: row.cover_image,
                        created_at: row.created_at,
                        // Review data: null if no review exists
                        has_review: row.review_id !== null,
                        review: row.review_id ? {
                            review_id: row.review_id,
                            rating: row.review_rating,
                            comment: row.review_comment,
                            review_date: row.review_date,
                            reviewer_name: row.reviewer_name
                        } : null
                    };
                    return order;
                });

                return res.status(200).json({
                    success: true,
                    orders: orders,
                    count: orders.length
                });

            } catch (queryError) {
                connection.release();
                throw queryError;
            }

        } catch (error) {
            console.error('Error fetching seller orders:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch orders',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET ORDER BY ID
    // =====================================================
    // HTTP: GET /api/orders/:order_id
    getOrderById: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { user_uid } = req.query;

            if (!order_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            if (!user_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required for authorization'
                });
            }

            const connection = await pool.getConnection();

            try {
                const query = `
                    SELECT
                        o.OrderID,
                        o.ListID,
                        o.UID as buyer_uid,
                        o.price,
                        o.tax,
                        o.platform_fee,
                        o.delivery_method,
                        o.status as order_status,
                        o.created_at,
                        l.ItemID,
                        l.UID as seller_uid,
                        i.title,
                        i.category,
                        i.condition,
                        buyer.name as buyer_name,
                        buyer.email as buyer_email,
                        buyer.phone as buyer_phone,
                        seller.name as seller_name,
                        seller.email as seller_email,
                        seller.phone as seller_phone,
                        l.status as listing_status,
                        (
                            SELECT lm.url
                            FROM ListingMedia lm
                                     LEFT JOIN ListingMedia_Image lmi ON lm.MediaID = lmi.MediaID
                            WHERE lm.ListID = l.ListID AND lm.media_type = 'image'
                            ORDER BY lmi.slot ASC, lm.created_at ASC
                            LIMIT 1
                        ) as cover_image
                    FROM \`Order\` o
                        INNER JOIN Listing l ON o.ListID = l.ListID
                        INNER JOIN Item i ON l.ItemID = i.ItemID
                        INNER JOIN User buyer ON o.UID = buyer.UID
                        INNER JOIN User seller ON l.UID = seller.UID
                    WHERE o.OrderID = ?
                `;

                const [rows] = await connection.execute(query, [order_id]);
                connection.release();

                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Order not found'
                    });
                }

                const orderData = rows[0];

                // Authorization check
                if (orderData.buyer_uid !== parseInt(user_uid) && orderData.seller_uid !== parseInt(user_uid)) {
                    return res.status(403).json({
                        success: false,
                        message: 'You are not authorized to view this order'
                    });
                }

                // Format response
                const order = {
                    order_id: orderData.OrderID,
                    listing_id: orderData.ListID,
                    item_id: orderData.ItemID,
                    title: orderData.title,
                    category: orderData.category,
                    condition: orderData.condition,
                    price: parseFloat(orderData.price),
                    tax: parseFloat(orderData.tax),
                    platform_fee: parseFloat(orderData.platform_fee),
                    total: (parseFloat(orderData.price) + parseFloat(orderData.tax) + parseFloat(orderData.platform_fee)).toFixed(2),
                    delivery_method: orderData.delivery_method,
                    order_status: orderData.order_status || 'PENDING',
                    buyer: {
                        uid: orderData.buyer_uid,
                        name: orderData.buyer_name,
                        email: orderData.buyer_email,
                        phone: orderData.buyer_phone
                    },
                    seller: {
                        uid: orderData.seller_uid,
                        name: orderData.seller_name,
                        email: orderData.seller_email,
                        phone: orderData.seller_phone
                    },
                    listing_status: orderData.listing_status,
                    cover_image: orderData.cover_image,
                    created_at: orderData.created_at
                };

                return res.status(200).json({
                    success: true,
                    order: order
                });

            } catch (queryError) {
                connection.release();
                throw queryError;
            }

        } catch (error) {
            console.error('Error fetching order:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch order',
                error: error.message
            });
        }
    },

    // =====================================================
    // COMPLETE ORDER
    // =====================================================
    // HTTP: POST /api/orders/:order_id/complete
    // Purpose: Mark an order as completed (seller marks delivery)
    completeOrder: async (req, res) => {
        const { order_id } = req.params;
        const { user_uid } = req.body;

        if (!order_id || !user_uid) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and User ID are required'
            });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Lock and fetch order
            const [orderRows] = await connection.execute(
                `SELECT o.OrderID, o.UID as buyer_uid, o.status as order_status,
                        l.UID as seller_uid, l.ItemID, l.ListID
                 FROM \`Order\` o
                          INNER JOIN Listing l ON o.ListID = l.ListID
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

            // Verify user is the seller
            if (orderData.seller_uid !== parseInt(user_uid)) {
                await connection.rollback();
                connection.release();
                return res.status(403).json({
                    success: false,
                    message: 'Only the seller can mark an order as completed'
                });
            }

            // Validate current status
            const currentStatus = orderData.order_status || 'PENDING';
            if (currentStatus !== 'PENDING' && !currentStatus.startsWith('CANCEL_REJECTED')) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Cannot complete order with status: ${currentStatus}`
                });
            }

            // Update order status to COMPLETED
            await connection.execute(
                `UPDATE \`Order\` SET status = 'COMPLETED' WHERE OrderID = ?`,
                [order_id]
            );

            // Update Item status to Sold
            await connection.execute(
                `UPDATE Item SET status = 'Sold' WHERE ItemID = ?`,
                [orderData.ItemID]
            );

            // Update Listing status to Sold
            await connection.execute(
                `UPDATE Listing SET status = 'Sold' WHERE ListID = ?`,
                [orderData.ListID]
            );

            await connection.commit();
            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Order marked as completed. The item has been sold successfully!'
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error('Error completing order:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to complete order',
                error: error.message
            });
        }
    },

    // =====================================================
    // REQUEST CANCEL ORDER
    // =====================================================
    // HTTP: POST /api/orders/:order_id/cancel/request
    // Purpose: Request cancellation of an order (buyer or seller)
    requestCancelOrder: async (req, res) => {
        const { order_id } = req.params;
        const { user_uid } = req.body;

        if (!order_id || !user_uid) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and User ID are required'
            });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Lock and fetch order
            const [orderRows] = await connection.execute(
                `SELECT o.OrderID, o.UID as buyer_uid, o.status as order_status,
                        l.UID as seller_uid
                 FROM \`Order\` o
                          INNER JOIN Listing l ON o.ListID = l.ListID
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
            const isBuyer = orderData.buyer_uid === parseInt(user_uid);
            const isSeller = orderData.seller_uid === parseInt(user_uid);

            // Verify user is buyer or seller
            if (!isBuyer && !isSeller) {
                await connection.rollback();
                connection.release();
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to cancel this order'
                });
            }

            // Validate current status
            const currentStatus = orderData.order_status || 'PENDING';
            const invalidStatuses = ['COMPLETED', 'CANCELLED_BY_BUYER', 'CANCELLED_BY_SELLER'];
            if (invalidStatuses.includes(currentStatus) || currentStatus.startsWith('CANCEL_REQUESTED')) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `Cannot request cancellation for order with status: ${currentStatus}`
                });
            }

            // Set new status based on who is requesting
            const newStatus = isBuyer ? 'CANCEL_REQUESTED_BY_BUYER' : 'CANCEL_REQUESTED_BY_SELLER';

            // Update order status
            await connection.execute(
                `UPDATE \`Order\` SET status = ? WHERE OrderID = ?`,
                [newStatus, order_id]
            );

            await connection.commit();
            connection.release();

            const otherParty = isBuyer ? 'seller' : 'buyer';
            return res.status(200).json({
                success: true,
                message: `Cancellation request submitted. Waiting for ${otherParty} approval.`
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error('Error requesting order cancellation:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to request cancellation',
                error: error.message
            });
        }
    },

    // =====================================================
    // ACCEPT CANCEL ORDER
    // =====================================================
    // HTTP: POST /api/orders/:order_id/cancel/accept
    // Purpose: Accept a cancellation request from the other party
    acceptCancelOrder: async (req, res) => {
        const { order_id } = req.params;
        const { user_uid } = req.body;

        if (!order_id || !user_uid) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and User ID are required'
            });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Lock and fetch order
            const [orderRows] = await connection.execute(
                `SELECT o.OrderID, o.UID as buyer_uid, o.status as order_status,
                        l.UID as seller_uid, l.ItemID, l.ListID
                 FROM \`Order\` o
                          INNER JOIN Listing l ON o.ListID = l.ListID
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
            const isBuyer = orderData.buyer_uid === parseInt(user_uid);
            const isSeller = orderData.seller_uid === parseInt(user_uid);

            // Verify user is buyer or seller
            if (!isBuyer && !isSeller) {
                await connection.rollback();
                connection.release();
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to accept this cancellation'
                });
            }

            const currentStatus = orderData.order_status || 'PENDING';

            // Validate: Only the OTHER party can accept the cancellation
            // If buyer requested, seller must accept. If seller requested, buyer must accept.
            if (currentStatus === 'CANCEL_REQUESTED_BY_BUYER' && !isSeller) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Only the seller can accept a cancellation request from the buyer'
                });
            }

            if (currentStatus === 'CANCEL_REQUESTED_BY_SELLER' && !isBuyer) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Only the buyer can accept a cancellation request from the seller'
                });
            }

            // Validate current status
            if (currentStatus !== 'CANCEL_REQUESTED_BY_BUYER' && currentStatus !== 'CANCEL_REQUESTED_BY_SELLER') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'There is no pending cancellation request to accept'
                });
            }

            // Determine final cancelled status
            const newStatus = currentStatus === 'CANCEL_REQUESTED_BY_BUYER'
                ? 'CANCELLED_BY_BUYER'
                : 'CANCELLED_BY_SELLER';

            // Update order status
            await connection.execute(
                `UPDATE \`Order\` SET status = ? WHERE OrderID = ?`,
                [newStatus, order_id]
            );

            // Release item - set status back to available
            await connection.execute(
                `UPDATE Item SET status = 'available' WHERE ItemID = ?`,
                [orderData.ItemID]
            );

            // Release listing - set status back to active
            await connection.execute(
                `UPDATE Listing SET status = 'active' WHERE ListID = ?`,
                [orderData.ListID]
            );

            await connection.commit();
            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Order has been cancelled. The item is now available for purchase again.'
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error('Error accepting order cancellation:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to accept cancellation',
                error: error.message
            });
        }
    },

    // =====================================================
    // REJECT CANCEL ORDER
    // =====================================================
    // HTTP: POST /api/orders/:order_id/cancel/reject
    // Purpose: Reject a cancellation request from the other party
    rejectCancelOrder: async (req, res) => {
        const { order_id } = req.params;
        const { user_uid } = req.body;

        if (!order_id || !user_uid) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and User ID are required'
            });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Lock and fetch order
            const [orderRows] = await connection.execute(
                `SELECT o.OrderID, o.UID as buyer_uid, o.status as order_status,
                        l.UID as seller_uid
                 FROM \`Order\` o
                          INNER JOIN Listing l ON o.ListID = l.ListID
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
            const isBuyer = orderData.buyer_uid === parseInt(user_uid);
            const isSeller = orderData.seller_uid === parseInt(user_uid);

            // Verify user is buyer or seller
            if (!isBuyer && !isSeller) {
                await connection.rollback();
                connection.release();
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to reject this cancellation'
                });
            }

            const currentStatus = orderData.order_status || 'PENDING';

            // Validate: Only the OTHER party can reject the cancellation
            if (currentStatus === 'CANCEL_REQUESTED_BY_BUYER' && !isSeller) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Only the seller can reject a cancellation request from the buyer'
                });
            }

            if (currentStatus === 'CANCEL_REQUESTED_BY_SELLER' && !isBuyer) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'Only the buyer can reject a cancellation request from the seller'
                });
            }

            // Validate current status
            if (currentStatus !== 'CANCEL_REQUESTED_BY_BUYER' && currentStatus !== 'CANCEL_REQUESTED_BY_SELLER') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'There is no pending cancellation request to reject'
                });
            }

            // Determine rejected status
            const newStatus = currentStatus === 'CANCEL_REQUESTED_BY_BUYER'
                ? 'CANCEL_REJECTED_BY_SELLER'
                : 'CANCEL_REJECTED_BY_BUYER';

            // Update order status
            await connection.execute(
                `UPDATE \`Order\` SET status = ? WHERE OrderID = ?`,
                [newStatus, order_id]
            );

            // Item and Listing remain reserved
            await connection.commit();
            connection.release();

            return res.status(200).json({
                success: true,
                message: 'Cancellation request has been rejected. The order remains active.'
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error('Error rejecting order cancellation:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to reject cancellation',
                error: error.message
            });
        }
    }
};

module.exports = orderController;
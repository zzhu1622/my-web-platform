const pool = require('../config/database');

// Order Controller Module
// Handles all order-related operations: creation, retrieval, status updates
// Implements transaction-based order processing to ensure data consistency
const orderController = {

    // =====================================================
    // CREATE ORDER - TRANSACTION-BASED PURCHASE FLOW
    // =====================================================
    // HTTP: POST /api/orders/create
    // Purpose: Create a new order and reserve the listing/item atomically
    // Request Body:
    //   {
    //     listing_id: number,       // Required: ID of the listing being purchased
    //     buyer_uid: number,        // Required: ID of the buyer (from session)
    //     delivery_method: string,  // Required: One of the delivery options
    //     delivery_note: string     // Optional: Additional delivery instructions (if method is "Other")
    //   }
    // Response:
    //   Success: { success: true, order_id: number, message: string }
    //   Error: { success: false, message: string }
    // Process Flow:
    //   1. Start database transaction
    //   2. Lock listing and item rows (SELECT FOR UPDATE)
    //   3. Validate listing is purchasable (status = active, not self-purchase)
    //   4. Validate delivery method
    //   5. Compute order pricing (tax, platform fee)
    //   6. Insert order record
    //   7. Update Item status to 'reserved'
    //   8. Update Listing status to 'reserved'
    //   9. Commit transaction
    // Error Handling:
    //   - Any validation failure or error rolls back entire transaction
    //   - Prevents race conditions between concurrent buyers
    createOrder: async (req, res) => {
        // Extract order details from request body
        const { listing_id, buyer_uid, delivery_method, delivery_note } = req.body;

        // Input validation: check required fields
        if (!listing_id || !buyer_uid || !delivery_method) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: listing_id, buyer_uid, and delivery_method are required'
            });
        }

        // Validate delivery method is one of the allowed options
        const validDeliveryMethods = [
            'Pick up at the seller door',
            'Delivered to your door',
            'Other methods'
        ];

        if (!validDeliveryMethods.includes(delivery_method)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery method. Must be one of: Pick up at the seller door, Delivered to your door, Other methods'
            });
        }

        // If delivery method is "Other methods", require delivery note
        if (delivery_method === 'Other methods' && (!delivery_note || delivery_note.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'Delivery note is required when selecting "Other methods"'
            });
        }

        // If delivery method is "Other methods", validate delivery note length
        if (delivery_method === 'Other methods' && delivery_note.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Delivery note must not exceed 500 characters'
            });
        }

        // Get database connection for transaction processing
        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            console.error('Database connection failed:', dbError);
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // Start transaction to ensure atomicity
            // All operations will succeed together or fail together
            await connection.beginTransaction();
            console.log('Transaction started for order creation');

            // Step 1: Lock the listing and item rows for update
            // FOR UPDATE clause prevents other transactions from modifying these rows
            // This prevents race conditions where two buyers try to purchase same item
            const lockQuery = `
                SELECT 
                    l.ListID,
                    l.UID as seller_uid,
                    l.ItemID,
                    l.status as listing_status,
                    i.status as item_status,
                    i.selling_price
                FROM Listing l
                INNER JOIN Item i ON l.ItemID = i.ItemID
                WHERE l.ListID = ?
                FOR UPDATE
            `;

            const [lockRows] = await connection.execute(lockQuery, [listing_id]);

            // Check if listing exists
            if (lockRows.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            const listingData = lockRows[0];

            // Step 2: Validate listing is purchasable
            // Check listing status is 'active'
            if (listingData.listing_status !== 'active') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `This item is no longer available. Current status: ${listingData.listing_status}`
                });
            }

            // Check item status is 'available'
            if (listingData.item_status !== 'available') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: `This item is no longer available. Current status: ${listingData.item_status}`
                });
            }

            // Prevent user from buying their own listing
            if (listingData.seller_uid === buyer_uid) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: 'You cannot purchase your own listing'
                });
            }

            // Step 3: Compute order pricing
            // Price is taken from item's selling_price (server-side validation)
            const price = parseFloat(listingData.selling_price);
            
            // Calculate tax: 8% of the selling price
            const tax = parseFloat((price * 0.08).toFixed(2));
            
            // Calculate platform fee: 5% of the selling price
            const platform_fee = parseFloat((price * 0.05).toFixed(2));

            console.log('Order pricing calculated:', { price, tax, platform_fee });

            // Step 4: Insert the order record
            // Create new order with all computed values
            // Delivery method and optional delivery note are stored for reference
            const insertOrderQuery = `
                INSERT INTO \`Order\` (UID, ListID, price, tax, platform_fee, delivery_method)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const orderValues = [
                buyer_uid,
                listing_id,
                price,
                tax,
                platform_fee,
                delivery_method === 'Other methods' ? `${delivery_method}: ${delivery_note}` : delivery_method
            ];

            const [orderResult] = await connection.execute(insertOrderQuery, orderValues);
            const order_id = orderResult.insertId;

            console.log('Order created with ID:', order_id);

            // Step 5: Update Item status to 'reserved'
            // Once order is created, mark item as reserved
            const updateItemQuery = `
                UPDATE Item
                SET status = 'reserved'
                WHERE ItemID = ?
            `;

            await connection.execute(updateItemQuery, [listingData.ItemID]);
            console.log('Item status updated to reserved');

            // Step 6: Update Listing status to 'reserved'
            // Mark listing as reserved so no other buyers can purchase
            const updateListingQuery = `
                UPDATE Listing
                SET status = 'reserved'
                WHERE ListID = ?
            `;

            await connection.execute(updateListingQuery, [listing_id]);
            console.log('Listing status updated to reserved');

            // Commit transaction: all changes are now permanent
            await connection.commit();
            console.log('Transaction committed successfully');

            // Release database connection back to pool
            connection.release();

            // Return success response with order details
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
                    delivery_note: delivery_method === 'Other methods' ? delivery_note : null
                }
            });

        } catch (error) {
            // If any error occurs, rollback transaction
            // This ensures database remains consistent even if something fails
            try {
                await connection.rollback();
                console.log('Transaction rolled back due to error');
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError);
            }

            // Release connection
            connection.release();

            console.error('Error creating order:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create order. Please try again.',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET USER ORDERS (AS BUYER)
    // =====================================================
    // HTTP: GET /api/orders/buyer/:buyer_uid
    // Purpose: Retrieve all orders placed by a specific buyer
    // URL Parameters: buyer_uid - ID of the buyer
    // Response: { success: true, orders: array, count: number }
    // Returns: List of orders with listing and item details
    getUserOrders: async (req, res) => {
        try {
            const { buyer_uid } = req.params;

            // Validate buyer_uid parameter
            if (!buyer_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Buyer UID is required'
                });
            }

            // Get database connection
            const connection = await pool.getConnection();

            try {
                // Query to fetch all orders for this buyer with full details
                const query = `
                    SELECT 
                        o.OrderID,
                        o.ListID,
                        o.price,
                        o.tax,
                        o.platform_fee,
                        o.delivery_method,
                        o.created_at,
                        l.ItemID,
                        i.title,
                        i.category,
                        i.condition,
                        l.UID as seller_uid,
                        u.name as seller_name,
                        u.email as seller_email,
                        i.status as item_status,
                        l.status as listing_status
                    FROM \`Order\` o
                    INNER JOIN Listing l ON o.ListID = l.ListID
                    INNER JOIN Item i ON l.ItemID = i.ItemID
                    INNER JOIN User u ON l.UID = u.UID
                    WHERE o.UID = ?
                    ORDER BY o.created_at DESC
                `;

                const [rows] = await connection.execute(query, [buyer_uid]);
                connection.release();

                // Format response with computed totals
                const orders = rows.map(row => ({
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
                    seller: {
                        uid: row.seller_uid,
                        name: row.seller_name,
                        email: row.seller_email
                    },
                    item_status: row.item_status,
                    listing_status: row.listing_status,
                    created_at: row.created_at
                }));

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
            console.error('Error fetching user orders:', error);
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
    // Purpose: Retrieve details of a specific order
    // URL Parameters: order_id - ID of the order
    // Query Parameters: user_uid - ID of requesting user (for authorization)
    // Response: { success: true, order: object }
    // Authorization: Only buyer or seller can view order details
    getOrderById: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { user_uid } = req.query;

            // Validate required parameters
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

            // Get database connection
            const connection = await pool.getConnection();

            try {
                // Query to fetch order with full details
                const query = `
                    SELECT 
                        o.OrderID,
                        o.UID as buyer_uid,
                        o.ListID,
                        o.price,
                        o.tax,
                        o.platform_fee,
                        o.delivery_method,
                        o.created_at,
                        l.ItemID,
                        l.UID as seller_uid,
                        i.title,
                        i.description,
                        i.category,
                        i.condition,
                        i.status as item_status,
                        l.status as listing_status,
                        buyer.name as buyer_name,
                        buyer.email as buyer_email,
                        buyer.phone as buyer_phone,
                        seller.name as seller_name,
                        seller.email as seller_email,
                        seller.phone as seller_phone
                    FROM \`Order\` o
                    INNER JOIN Listing l ON o.ListID = l.ListID
                    INNER JOIN Item i ON l.ItemID = i.ItemID
                    INNER JOIN User buyer ON o.UID = buyer.UID
                    INNER JOIN User seller ON l.UID = seller.UID
                    WHERE o.OrderID = ?
                `;

                const [rows] = await connection.execute(query, [order_id]);
                connection.release();

                // Check if order exists
                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Order not found'
                    });
                }

                const orderData = rows[0];

                // Authorization check: only buyer or seller can view order
                const isAuthorized = 
                    parseInt(user_uid) === orderData.buyer_uid || 
                    parseInt(user_uid) === orderData.seller_uid;

                if (!isAuthorized) {
                    return res.status(403).json({
                        success: false,
                        message: 'You are not authorized to view this order'
                    });
                }

                // Format and return order details
                const order = {
                    order_id: orderData.OrderID,
                    listing_id: orderData.ListID,
                    item_id: orderData.ItemID,
                    item: {
                        title: orderData.title,
                        description: orderData.description,
                        category: orderData.category,
                        condition: orderData.condition,
                        status: orderData.item_status
                    },
                    pricing: {
                        price: parseFloat(orderData.price),
                        tax: parseFloat(orderData.tax),
                        platform_fee: parseFloat(orderData.platform_fee),
                        total: (parseFloat(orderData.price) + parseFloat(orderData.tax) + parseFloat(orderData.platform_fee)).toFixed(2)
                    },
                    delivery_method: orderData.delivery_method,
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
            console.error('Error fetching order details:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch order details',
                error: error.message
            });
        }
    },

    // =====================================================
    // GET SELLER ORDERS
    // =====================================================
    // HTTP: GET /api/orders/seller/:seller_uid
    // Purpose: Retrieve all orders for items sold by a specific seller
    // URL Parameters: seller_uid - ID of the seller
    // Response: { success: true, orders: array, count: number }
    // Returns: List of orders for seller's listings
    getSellerOrders: async (req, res) => {
        try {
            const { seller_uid } = req.params;

            // Validate seller_uid parameter
            if (!seller_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Seller UID is required'
                });
            }

            // Get database connection
            const connection = await pool.getConnection();

            try {
                // Query to fetch all orders for this seller's listings
                const query = `
                    SELECT 
                        o.OrderID,
                        o.ListID,
                        o.price,
                        o.tax,
                        o.platform_fee,
                        o.delivery_method,
                        o.created_at,
                        l.ItemID,
                        i.title,
                        i.category,
                        i.condition,
                        o.UID as buyer_uid,
                        u.name as buyer_name,
                        u.email as buyer_email,
                        i.status as item_status,
                        l.status as listing_status
                    FROM \`Order\` o
                    INNER JOIN Listing l ON o.ListID = l.ListID
                    INNER JOIN Item i ON l.ItemID = i.ItemID
                    INNER JOIN User u ON o.UID = u.UID
                    WHERE l.UID = ?
                    ORDER BY o.created_at DESC
                `;

                const [rows] = await connection.execute(query, [seller_uid]);
                connection.release();

                // Format response with computed totals
                const orders = rows.map(row => ({
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
                    buyer: {
                        uid: row.buyer_uid,
                        name: row.buyer_name,
                        email: row.buyer_email
                    },
                    item_status: row.item_status,
                    listing_status: row.listing_status,
                    created_at: row.created_at
                }));

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
    }
};

module.exports = orderController;

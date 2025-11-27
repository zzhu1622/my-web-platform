// File: backend/src/controllers/accountController.js
// Purpose: Handles all account-related operations for the "My Account" page
// Features: User profile, password change, listing management, reviews received

const pool = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Account Controller Module
// Handles user profile operations, password changes, and listing management
const accountController = {

    // =====================================================
    // GET USER PROFILE
    // =====================================================
    // HTTP: GET /api/account/profile/:uid
    // Purpose: Retrieve user profile information for Personal Information tab
    // URL Parameters: uid - User ID
    // Response: { success: boolean, user: object }
    // Returns: UID, name, email, phone, move_out_date (excludes password hash)
    getUserProfile: async (req, res) => {
        try {
            const { uid } = req.params;

            // Validate input
            if (!uid) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

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
                // Query user profile data (exclude password hash for security)
                const query = `
                    SELECT 
                        UID, 
                        name, 
                        email, 
                        phone, 
                        move_out_date,
                        created_at
                    FROM User 
                    WHERE UID = ?
                `;

                const [rows] = await connection.execute(query, [uid]);
                connection.release();

                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                const user = rows[0];

                return res.status(200).json({
                    success: true,
                    user: {
                        UID: user.UID,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        move_out_date: user.move_out_date,
                        created_at: user.created_at
                    }
                });

            } catch (queryError) {
                connection.release();
                console.error('Query error:', queryError);
                return res.status(503).json({
                    success: false,
                    message: 'Unable to fetch user profile'
                });
            }

        } catch (error) {
            console.error('Unexpected error in getUserProfile:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // =====================================================
    // GET USER OVERVIEW
    // =====================================================
    // HTTP: GET /api/account/overview/:uid
    // Purpose: Retrieve user overview data including public info and reviews received
    // URL Parameters: uid - User ID (seller)
    // Response: { success: boolean, user: object, reviews: array, stats: object }
    // Note: Reviews are those received by the user as a seller (hides reviewer identity)
    getUserOverview: async (req, res) => {
        try {
            const { uid } = req.params;

            if (!uid) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

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
                // Step 1: Get user basic public info
                const userQuery = `
                    SELECT 
                        UID, 
                        name, 
                        email, 
                        phone,
                        created_at
                    FROM User 
                    WHERE UID = ?
                `;

                const [userRows] = await connection.execute(userQuery, [uid]);

                if (userRows.length === 0) {
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                const user = userRows[0];

                // Step 2: Get reviews RECEIVED by this user as seller
                // Path: Review -> Order -> Listing (where Listing.UID = seller_uid)
                // IMPORTANT: Do NOT include reviewer identity (Review.UID)
                const reviewsQuery = `
                    SELECT 
                        r.ReviewID,
                        r.rating,
                        r.comment,
                        r.review_date,
                        i.title as item_title
                    FROM Review r
                    INNER JOIN \`Order\` o ON r.OrderID = o.OrderID
                    INNER JOIN Listing l ON o.ListID = l.ListID
                    INNER JOIN Item i ON l.ItemID = i.ItemID
                    WHERE l.UID = ?
                    ORDER BY r.review_date DESC
                `;

                const [reviewRows] = await connection.execute(reviewsQuery, [uid]);

                // Step 3: Calculate average rating (total score)
                let totalRating = 0;
                reviewRows.forEach(row => {
                    totalRating += row.rating;
                });
                const averageRating = reviewRows.length > 0 
                    ? (totalRating / reviewRows.length).toFixed(1) 
                    : 0;

                // Step 4: Get additional stats
                const statsQuery = `
                    SELECT 
                        COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.ListID END) AS active_listings,
                        COUNT(DISTINCT o.OrderID) AS items_sold
                    FROM User u
                    LEFT JOIN Listing l ON u.UID = l.UID
                    LEFT JOIN \`Order\` o ON l.ListID = o.ListID
                    WHERE u.UID = ?
                    GROUP BY u.UID
                `;

                const [statsRows] = await connection.execute(statsQuery, [uid]);
                connection.release();

                const stats = statsRows.length > 0 ? statsRows[0] : {
                    active_listings: 0,
                    items_sold: 0
                };

                // Format reviews (hide reviewer identity as per requirements)
                const reviews = reviewRows.map(row => ({
                    review_id: row.ReviewID,
                    rating: row.rating,
                    comment: row.comment,
                    review_date: row.review_date,
                    item_title: row.item_title
                }));

                return res.status(200).json({
                    success: true,
                    user: {
                        UID: user.UID,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        member_since: user.created_at
                    },
                    reviews: reviews,
                    stats: {
                        total_score: parseFloat(averageRating),
                        review_count: reviewRows.length,
                        active_listings: stats.active_listings,
                        items_sold: stats.items_sold
                    }
                });

            } catch (queryError) {
                connection.release();
                console.error('Query error:', queryError);
                return res.status(503).json({
                    success: false,
                    message: 'Unable to fetch user overview'
                });
            }

        } catch (error) {
            console.error('Unexpected error in getUserOverview:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================
    // HTTP: POST /api/account/change-password
    // Purpose: Update user password after verifying old password
    // Request Body: { uid, old_password, new_password, confirm_password }
    // Validation:
    //   1. old_password must match current password
    //   2. new_password must match confirm_password
    //   3. new_password must meet policy (min 6 chars)
    changePassword: async (req, res) => {
        try {
            const { uid, old_password, new_password, confirm_password } = req.body;

            // Step 1: Validate required fields
            if (!uid || !old_password || !new_password || !confirm_password) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required: uid, old_password, new_password, confirm_password'
                });
            }

            // Step 2: Validate new_password matches confirm_password
            if (new_password !== confirm_password) {
                return res.status(400).json({
                    success: false,
                    message: 'New password and confirm password do not match'
                });
            }

            // Step 3: Validate password policy (minimum 6 characters)
            if (new_password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            // Step 4: Check if new password is same as old password
            if (old_password === new_password) {
                return res.status(400).json({
                    success: false,
                    message: 'New password cannot be the same as the current password'
                });
            }

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
                // Step 5: Get current password hash from database
                const [rows] = await connection.execute(
                    'SELECT password FROM User WHERE UID = ?',
                    [uid]
                );

                if (rows.length === 0) {
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                const currentPasswordHash = rows[0].password;

                // Step 6: Verify old password matches current password
                const passwordMatch = await bcrypt.compare(old_password, currentPasswordHash);
                if (!passwordMatch) {
                    connection.release();
                    return res.status(401).json({
                        success: false,
                        message: 'Current password is incorrect'
                    });
                }

                // Step 7: Hash new password
                const saltRounds = 10;
                const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

                // Step 8: Update password in database
                const updateQuery = 'UPDATE User SET password = ? WHERE UID = ?';
                await connection.execute(updateQuery, [newPasswordHash, uid]);
                connection.release();

                console.log(`Password changed successfully for user UID: ${uid}`);

                return res.status(200).json({
                    success: true,
                    message: 'Password updated successfully'
                });

            } catch (queryError) {
                connection.release();
                console.error('Query error:', queryError);
                return res.status(503).json({
                    success: false,
                    message: 'Unable to update password'
                });
            }

        } catch (error) {
            console.error('Unexpected error in changePassword:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // =====================================================
    // GET USER LISTINGS FOR MANAGEMENT
    // =====================================================
    // HTTP: GET /api/account/listings/:uid
    // Purpose: Retrieve all listings posted by user for Listing Management tab
    // URL Parameters: uid - User ID (seller)
    // Response: { success: boolean, listings: array, count: number }
    // Returns: ListID, ItemID, title, category, condition, prices, status, cover_image, expire_date
    getUserListings: async (req, res) => {
        try {
            const { uid } = req.params;

            if (!uid) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

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
                // Query listings with item info and cover image
                // Include all statuses for management (active, reserved, sold, expired)
                const query = `
                    SELECT 
                        l.ListID,
                        l.ItemID,
                        l.status as listing_status,
                        l.description as condition_details,
                        l.expire_date,
                        l.created_at,
                        i.title,
                        i.category,
                        i.condition,
                        i.original_price,
                        i.selling_price,
                        i.description as item_description,
                        i.status as item_status,
                        (
                            SELECT lm.url 
                            FROM ListingMedia lm
                            LEFT JOIN ListingMedia_Image lmi ON lm.MediaID = lmi.MediaID
                            WHERE lm.ListID = l.ListID AND lm.media_type = 'image'
                            ORDER BY lmi.slot ASC, lm.created_at ASC
                            LIMIT 1
                        ) as cover_image,
                        (
                            SELECT COUNT(*) 
                            FROM \`Order\` o 
                            WHERE o.ListID = l.ListID
                        ) as order_count
                    FROM Listing l
                    INNER JOIN Item i ON l.ItemID = i.ItemID
                    WHERE l.UID = ?
                    ORDER BY l.created_at DESC
                `;

                const [rows] = await connection.execute(query, [uid]);
                connection.release();

                // Format listings for response
                const listings = rows.map(row => ({
                    list_id: row.ListID,
                    item_id: row.ItemID,
                    title: row.title,
                    category: row.category,
                    condition: row.condition,
                    original_price: row.original_price ? parseFloat(row.original_price) : null,
                    selling_price: parseFloat(row.selling_price),
                    listing_status: row.listing_status,
                    item_status: row.item_status,
                    condition_details: row.condition_details,
                    item_description: row.item_description,
                    expire_date: row.expire_date,
                    created_at: row.created_at,
                    cover_image: row.cover_image,
                    order_count: row.order_count,
                    // Determine if listing can be edited/deleted
                    can_edit: row.listing_status === 'active' && row.order_count === 0,
                    can_delete: row.order_count === 0
                }));

                return res.status(200).json({
                    success: true,
                    listings: listings,
                    count: listings.length
                });

            } catch (queryError) {
                connection.release();
                console.error('Query error:', queryError);
                return res.status(503).json({
                    success: false,
                    message: 'Unable to fetch user listings'
                });
            }

        } catch (error) {
            console.error('Unexpected error in getUserListings:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // =====================================================
    // DELETE LISTING
    // =====================================================
    // HTTP: DELETE /api/account/listings/:listId
    // Purpose: Delete a listing along with its item and media
    // URL Parameters: listId - Listing ID to delete
    // Query Parameters: uid - User ID for ownership verification
    // Validation:
    //   1. Listing must belong to requesting user
    //   2. No orders exist for this listing
    deleteListing: async (req, res) => {
        try {
            const { listId } = req.params;
            const { uid } = req.query;

            // Validate input
            if (!listId || !uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Listing ID and User ID are required'
                });
            }

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
                await connection.beginTransaction();

                // Step 1: Verify listing exists and belongs to user
                const [listingRows] = await connection.execute(
                    'SELECT ListID, UID, ItemID, status FROM Listing WHERE ListID = ?',
                    [listId]
                );

                if (listingRows.length === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Listing not found'
                    });
                }

                const listing = listingRows[0];

                // Step 2: Verify ownership
                if (listing.UID !== parseInt(uid)) {
                    await connection.rollback();
                    connection.release();
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to delete this listing'
                    });
                }

                // Step 3: Check if listing has any orders
                const [orderRows] = await connection.execute(
                    'SELECT COUNT(*) as order_count FROM `Order` WHERE ListID = ?',
                    [listId]
                );

                if (orderRows[0].order_count > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot delete listing with existing orders. This listing has been purchased.'
                    });
                }

                // Step 4: Get media files to delete from disk
                const [mediaRows] = await connection.execute(
                    'SELECT MediaID, url, media_type FROM ListingMedia WHERE ListID = ?',
                    [listId]
                );

                const itemId = listing.ItemID;

                // Step 5: Delete listing (ListingMedia will cascade delete due to ON DELETE CASCADE)
                await connection.execute(
                    'DELETE FROM Listing WHERE ListID = ? AND UID = ?',
                    [listId, uid]
                );

                // Step 6: Delete item
                await connection.execute(
                    'DELETE FROM Item WHERE ItemID = ? AND UID = ?',
                    [itemId, uid]
                );

                await connection.commit();
                connection.release();

                // Step 7: Delete media files from disk (non-critical, log errors but don't fail)
                const photoDir = path.resolve(__dirname, '../../Database/photo');
                const videoDir = path.resolve(__dirname, '../../Database/video');

                mediaRows.forEach(media => {
                    try {
                        const filename = media.url;
                        let filePath;

                        if (media.media_type === 'image') {
                            filePath = path.join(photoDir, filename);
                        } else if (media.media_type === 'video') {
                            filePath = path.join(videoDir, filename);
                        }

                        if (filePath && fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`Deleted media file: ${filename}`);
                        }
                    } catch (fileError) {
                        console.error(`Error deleting media file: ${media.url}`, fileError);
                    }
                });

                console.log(`Listing ${listId} and Item ${itemId} deleted successfully by user ${uid}`);

                return res.status(200).json({
                    success: true,
                    message: 'Listing deleted successfully'
                });

            } catch (queryError) {
                await connection.rollback();
                connection.release();
                console.error('Query error:', queryError);
                return res.status(503).json({
                    success: false,
                    message: 'Unable to delete listing'
                });
            }

        } catch (error) {
            console.error('Unexpected error in deleteListing:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // =====================================================
    // GET LISTING DETAIL FOR EDITING
    // =====================================================
    // HTTP: GET /api/account/listings/edit/:listId
    // Purpose: Retrieve full listing details for edit form pre-fill
    // URL Parameters: listId - Listing ID
    // Query Parameters: uid - User ID for ownership verification
    // Response: { success: boolean, listing: object, media: array }
    getListingForEdit: async (req, res) => {
        try {
            const { listId } = req.params;
            const { uid } = req.query;

            if (!listId || !uid) {
                return res.status(400).json({
                    success: false,
                    message: 'Listing ID and User ID are required'
                });
            }

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
                // Step 1: Get listing and item details
                const listingQuery = `
                    SELECT 
                        l.ListID,
                        l.UID,
                        l.ItemID,
                        l.status as listing_status,
                        l.description as condition_details,
                        l.expire_date,
                        l.created_at,
                        i.title,
                        i.category,
                        i.condition,
                        i.description as item_description,
                        i.original_price,
                        i.selling_price,
                        i.status as item_status
                    FROM Listing l
                    INNER JOIN Item i ON l.ItemID = i.ItemID
                    WHERE l.ListID = ?
                `;

                const [listingRows] = await connection.execute(listingQuery, [listId]);

                if (listingRows.length === 0) {
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Listing not found'
                    });
                }

                const listing = listingRows[0];

                // Step 2: Verify ownership
                if (listing.UID !== parseInt(uid)) {
                    connection.release();
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to edit this listing'
                    });
                }

                // Step 3: Check if listing can be edited
                const [orderRows] = await connection.execute(
                    'SELECT COUNT(*) as order_count FROM `Order` WHERE ListID = ?',
                    [listId]
                );

                if (orderRows[0].order_count > 0) {
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot edit listing with existing orders'
                    });
                }

                if (listing.listing_status !== 'active') {
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Only active listings can be edited'
                    });
                }

                // Step 4: Get all media for this listing
                const mediaQuery = `
                    SELECT 
                        lm.MediaID,
                        lm.media_type,
                        lm.url,
                        lm.alt_text,
                        lmi.slot as image_slot,
                        lmv.duration_sec as video_duration
                    FROM ListingMedia lm
                    LEFT JOIN ListingMedia_Image lmi ON lm.MediaID = lmi.MediaID
                    LEFT JOIN ListingMedia_Video lmv ON lm.MediaID = lmv.MediaID
                    WHERE lm.ListID = ?
                    ORDER BY 
                        CASE WHEN lm.media_type = 'image' THEN 0 ELSE 1 END,
                        lmi.slot ASC,
                        lm.created_at ASC
                `;

                const [mediaRows] = await connection.execute(mediaQuery, [listId]);
                connection.release();

                // Format media for response
                const media = mediaRows.map(row => ({
                    media_id: row.MediaID,
                    media_type: row.media_type,
                    url: row.url,
                    alt_text: row.alt_text,
                    slot: row.image_slot,
                    duration_sec: row.video_duration
                }));

                return res.status(200).json({
                    success: true,
                    listing: {
                        list_id: listing.ListID,
                        item_id: listing.ItemID,
                        title: listing.title,
                        category: listing.category,
                        condition: listing.condition,
                        item_description: listing.item_description,
                        condition_details: listing.condition_details,
                        original_price: listing.original_price ? parseFloat(listing.original_price) : null,
                        selling_price: parseFloat(listing.selling_price),
                        expire_date: listing.expire_date,
                        listing_status: listing.listing_status,
                        item_status: listing.item_status
                    },
                    media: media
                });

            } catch (queryError) {
                connection.release();
                console.error('Query error:', queryError);
                return res.status(503).json({
                    success: false,
                    message: 'Unable to fetch listing details'
                });
            }

        } catch (error) {
            console.error('Unexpected error in getListingForEdit:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    },

    // =====================================================
    // UPDATE LISTING
    // =====================================================
    // HTTP: PUT /api/account/listings/:listId
    // Purpose: Update listing and item details
    // URL Parameters: listId - Listing ID
    // Request Body: { uid, title, category, condition, description, 
    //                 selling_price, original_price, expire_date, condition_details }
    // Note: Media updates handled separately for simplicity
    updateListing: async (req, res) => {
        try {
            const { listId } = req.params;
            const {
                uid,
                title,
                category,
                condition,
                description,
                selling_price,
                original_price,
                expire_date,
                condition_details
            } = req.body;

            // Validate required fields
            if (!listId || !uid || !title || !category || !condition || !selling_price || !expire_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Validate expire_date is in the future
            const expireDateObj = new Date(expire_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expireDateObj < today) {
                return res.status(400).json({
                    success: false,
                    message: 'Expire date must be today or in the future'
                });
            }

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
                await connection.beginTransaction();

                // Step 1: Verify listing exists and belongs to user
                const [listingRows] = await connection.execute(
                    'SELECT ListID, UID, ItemID, status FROM Listing WHERE ListID = ?',
                    [listId]
                );

                if (listingRows.length === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Listing not found'
                    });
                }

                const listing = listingRows[0];

                if (listing.UID !== parseInt(uid)) {
                    await connection.rollback();
                    connection.release();
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to edit this listing'
                    });
                }

                // Step 2: Check if listing can be edited
                const [orderRows] = await connection.execute(
                    'SELECT COUNT(*) as order_count FROM `Order` WHERE ListID = ?',
                    [listId]
                );

                if (orderRows[0].order_count > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot edit listing with existing orders'
                    });
                }

                if (listing.status !== 'active') {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Only active listings can be edited'
                    });
                }

                const itemId = listing.ItemID;

                // Step 3: Update Item table
                const updateItemQuery = `
                    UPDATE Item 
                    SET 
                        title = ?,
                        category = ?,
                        \`condition\` = ?,
                        description = ?,
                        selling_price = ?,
                        original_price = ?,
                        expire_date = ?
                    WHERE ItemID = ? AND UID = ?
                `;

                await connection.execute(updateItemQuery, [
                    title.trim(),
                    category,
                    condition,
                    description || null,
                    selling_price,
                    original_price || null,
                    expire_date,
                    itemId,
                    uid
                ]);

                // Step 4: Update Listing table
                const updateListingQuery = `
                    UPDATE Listing 
                    SET 
                        description = ?,
                        expire_date = ?
                    WHERE ListID = ? AND UID = ?
                `;

                await connection.execute(updateListingQuery, [
                    condition_details || null,
                    expire_date,
                    listId,
                    uid
                ]);

                await connection.commit();
                connection.release();

                console.log(`Listing ${listId} updated successfully by user ${uid}`);

                return res.status(200).json({
                    success: true,
                    message: 'Listing updated successfully'
                });

            } catch (queryError) {
                await connection.rollback();
                connection.release();
                console.error('Query error:', queryError);
                return res.status(503).json({
                    success: false,
                    message: 'Unable to update listing'
                });
            }

        } catch (error) {
            console.error('Unexpected error in updateListing:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
};

module.exports = accountController;

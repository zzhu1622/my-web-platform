// Listing Controller Module
// Handles all listing-related API endpoints including:
// - Fetching all listings with search and filters
// - Fetching listing details by ID
// - Fetching user's own listings
// - Creating new listings with media upload
// - Fetching price reference data for similar sold items

const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

// =====================================================
// FUNCTION 1: Get all active listings with optional search and filters
// =====================================================
// Endpoint: GET /api/listings
// Query Parameters:
// - searchKeyword: string to search in item titles (partial match)
// - category: filter by specific category
// - sortBy: field to sort by (price or expire_date)
// - sortOrder: sort direction (asc or desc)
exports.getAllListings = async (req, res) => {
    try {
        // Extract query parameters from request
        const { searchKeyword, category, sortBy, sortOrder } = req.query;

        console.log('Fetching listings with params:', { searchKeyword, category, sortBy, sortOrder });

        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            console.error('Database connection failed:', dbError.message);
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // Build dynamic WHERE clause based on provided filters
            let whereConditions = ['l.status = ?'];
            let queryParams = ['active'];

            // Add search keyword filter if provided
            // Searches in item title using LIKE with wildcards
            if (searchKeyword && searchKeyword.trim() !== '') {
                whereConditions.push('i.title LIKE ?');
                queryParams.push(`%${searchKeyword.trim()}%`);
            }

            // Add category filter if provided
            if (category && category.trim() !== '') {
                whereConditions.push('i.category = ?');
                queryParams.push(category.trim());
            }

            // Build ORDER BY clause based on sortBy and sortOrder parameters
            let orderByClause = 'ORDER BY l.created_at DESC';
            if (sortBy) {
                const validSortFields = {
                    'price': 'i.selling_price',
                    'expire_date': 'l.expire_date'
                };
                const sortField = validSortFields[sortBy];
                if (sortField) {
                    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
                    orderByClause = `ORDER BY ${sortField} ${direction}`;
                }
            }

            // Construct the complete SQL query
            const query = `
                SELECT
                    l.ListID,
                    l.ItemID,
                    l.UID as seller_uid,
                    l.status,
                    l.expire_date,
                    i.title,
                    i.category,
                    i.condition,
                    i.selling_price,
                    i.original_price,
                    u.name as seller_name,
                    (
                        SELECT m.url
                        FROM ListingMedia m
                        LEFT JOIN ListingMedia_Image mi ON m.MediaID = mi.MediaID
                        WHERE m.ListID = l.ListID AND m.media_type = 'image'
                        ORDER BY mi.slot ASC, m.created_at ASC
                        LIMIT 1
                    ) as cover_image
                FROM Listing l
                JOIN Item i ON l.ItemID = i.ItemID
                JOIN User u ON l.UID = u.UID
                WHERE ${whereConditions.join(' AND ')}
                ${orderByClause}
            `;

            const [rows] = await connection.execute(query, queryParams);
            connection.release();

            // Format response data with images array structure
            const listings = rows.map(row => ({
                ListID: row.ListID,
                ItemID: row.ItemID,
                seller_uid: row.seller_uid,
                title: row.title,
                category: row.category,
                condition: row.condition,
                selling_price: parseFloat(row.selling_price),
                original_price: row.original_price ? parseFloat(row.original_price) : null,
                status: row.status,
                expire_date: row.expire_date,
                seller_name: row.seller_name,
                images: row.cover_image ? [row.cover_image] : []
            }));

            return res.status(200).json({
                success: true,
                message: 'Listings fetched successfully',
                data: listings,
                count: listings.length
            });

        } catch (queryError) {
            connection.release();
            console.error('Query error:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to fetch listings'
            });
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =====================================================
// FUNCTION 2: Get all unique categories from database
// =====================================================
// Endpoint: GET /api/listings/categories
exports.getCategories = async (req, res) => {
    try {
        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // Query distinct categories from Item table
            const query = `
                SELECT DISTINCT category
                FROM Item
                WHERE category IS NOT NULL AND category != ''
                ORDER BY category ASC
            `;

            const [rows] = await connection.execute(query);
            connection.release();

            // Extract category values from rows
            const categories = rows.map(row => row.category);

            return res.status(200).json({
                success: true,
                message: 'Categories fetched successfully',
                data: categories
            });

        } catch (queryError) {
            connection.release();
            console.error('Query error:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to fetch categories'
            });
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =====================================================
// FUNCTION 3: Get specific listing details by ID
// =====================================================
// Endpoint: GET /api/listings/:listingId
exports.getListingById = async (req, res) => {
    try {
        const { listingId } = req.params;
        console.log(`Fetching listing details for ID: ${listingId}`);

        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // Query listing details with item info, seller info, and all media
            const query = `
                SELECT
                    l.ListID,
                    l.ItemID,
                    l.UID as seller_uid,
                    l.status,
                    l.description as listing_description,
                    l.available_from_date,
                    l.expire_date,
                    l.created_at as listing_created_at,
                    i.title,
                    i.description as item_description,
                    i.category,
                    i.condition,
                    i.original_price,
                    i.selling_price,
                    i.status as item_status,
                    u.name as seller_name,
                    u.email as seller_email,
                    u.phone as seller_phone,
                    m.MediaID as media_id,
                    m.media_type,
                    m.url as image_url,
                    m.thumbnail_url,
                    m.alt_text,
                    m.created_at as media_created_at,
                    mi.slot as image_slot,
                    mv.duration_sec as video_duration
                FROM Listing l
                JOIN Item i ON l.ItemID = i.ItemID
                JOIN User u ON l.UID = u.UID
                LEFT JOIN ListingMedia m ON l.ListID = m.ListID
                LEFT JOIN ListingMedia_Image mi ON m.MediaID = mi.MediaID
                LEFT JOIN ListingMedia_Video mv ON m.MediaID = mv.MediaID
                WHERE l.ListID = ?
                ORDER BY mi.slot ASC, m.created_at ASC
            `;

            const [rows] = await connection.execute(query, [listingId]);
            connection.release();

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            // Format the response with grouped media
            const firstRow = rows[0];
            const listing = {
                ListID: firstRow.ListID,
                ItemID: firstRow.ItemID,
                title: firstRow.title,
                description: firstRow.item_description,
                category: firstRow.category,
                condition: firstRow.condition,
                selling_price: parseFloat(firstRow.selling_price),
                status: firstRow.status,
                expire_date: firstRow.expire_date,
                seller: {
                    uid: firstRow.seller_uid,
                    name: firstRow.seller_name,
                    email: firstRow.seller_email,
                    phone: firstRow.seller_phone
                },
                images: [],
                videos: [],
                cover_image: null,
                original_price: firstRow.original_price ? parseFloat(firstRow.original_price) : null,
                descriptions: {
                    item_description: firstRow.item_description,
                    listing_description: firstRow.listing_description
                },
                available_from_date: firstRow.available_from_date,
                media: {
                    images: [],
                    videos: [],
                    total_count: 0
                }
            };

            // Separate images and videos into different arrays with metadata
            const processedMediaIds = new Set();
            rows.forEach(row => {
                if (row.image_url && !processedMediaIds.has(row.media_id)) {
                    processedMediaIds.add(row.media_id);

                    const mediaItem = {
                        MediaID: row.media_id,
                        url: row.image_url,
                        type: row.media_type,
                        alt_text: row.alt_text,
                        created_at: row.media_created_at
                    };

                    if (row.media_type === 'image') {
                        listing.images.push(row.image_url);
                        mediaItem.slot = row.image_slot;
                        listing.media.images.push(mediaItem);
                    } else if (row.media_type === 'video') {
                        listing.videos.push(row.image_url);
                        mediaItem.thumbnail = row.thumbnail_url;
                        mediaItem.duration_sec = row.video_duration;
                        listing.media.videos.push(mediaItem);
                    }
                }
            });

            // Update media count
            listing.media.total_count = listing.images.length + listing.videos.length;

            // Set cover image to first image
            if (listing.images.length > 0) {
                listing.cover_image = listing.images[0];
            }

            return res.status(200).json({
                success: true,
                message: 'Listing details fetched successfully',
                data: listing
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
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =====================================================
// FUNCTION 4: Get all listings posted by a specific seller
// =====================================================
// Endpoint: GET /api/listings/user/:userId
exports.getUserListings = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`Fetching listings for user: ${userId}`);

        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            const query = `
                SELECT
                    l.ListID,
                    l.ItemID,
                    l.UID as seller_uid,
                    i.title,
                    i.selling_price,
                    i.original_price,
                    l.status,
                    l.expire_date,
                    u.name as seller_name,
                    (
                        SELECT m.url
                        FROM ListingMedia m
                        LEFT JOIN ListingMedia_Image mi ON m.MediaID = mi.MediaID
                        WHERE m.ListID = l.ListID AND m.media_type = 'image'
                        ORDER BY mi.slot ASC, m.created_at ASC
                        LIMIT 1
                    ) as cover_image
                FROM Listing l
                JOIN Item i ON l.ItemID = i.ItemID
                JOIN User u ON l.UID = u.UID
                WHERE l.UID = ?
                ORDER BY l.created_at DESC
            `;

            const [rows] = await connection.execute(query, [userId]);
            connection.release();

            return res.status(200).json({
                success: true,
                data: rows,
                count: rows.length
            });

        } catch (queryError) {
            connection.release();
            console.error('Query error:', queryError.message);
            return res.status(503).json({
                success: false,
                message: 'Unable to fetch user listings'
            });
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =====================================================
// FUNCTION 5: Create a new listing with media files
// =====================================================
// Endpoint: POST /api/listings/create
// Request Body (multipart/form-data):
// - user_id: seller's UID
// - title: item title
// - category: item category
// - condition: item condition (like_new, good, fair, poor)
// - description: item description
// - selling_price: asking price
// - original_price: optional original price
// - expire_date: listing expiration date
// - condition_details: optional condition details
// - images: array of image files
// - video: optional video file
exports.createListing = async (req, res) => {
    // Extract uploaded files from multer middleware
    const imageFiles = req.files?.images || [];
    const videoFile = req.files?.video ? req.files.video[0] : null;

    let connection;
    let createdItemId = null;
    let createdListId = null;
    const createdMediaIds = [];

    try {
        // Extract form data from request body
        const {
            user_id,
            title,
            category,
            condition,
            description,
            selling_price,
            original_price,
            expire_date,
            condition_details
        } = req.body;

        console.log('Creating listing with data:', { user_id, title, category, condition });

        // Validate required fields
        if (!user_id || !title || !category || !condition || !description || !selling_price || !expire_date) {
            // Delete uploaded files if validation fails
            deleteUploadedFiles(imageFiles, videoFile);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate at least 1 image is uploaded
        if (imageFiles.length === 0) {
            // Delete uploaded video if any
            if (videoFile) {
                fs.unlinkSync(videoFile.path);
            }
            return res.status(400).json({
                success: false,
                message: 'At least 1 image is required'
            });
        }

        // Get database connection
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            deleteUploadedFiles(imageFiles, videoFile);
            console.error('Database connection failed:', dbError.message);
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // Start transaction for atomic operation
            await connection.beginTransaction();

            // Step 1: Insert Item record
            const insertItemQuery = `
                INSERT INTO Item (
                    UID, title, description, category, \`condition\`,
                    original_price, selling_price, status,
                    available_from_date, expire_date, post_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'available', CURDATE(), ?, NOW())
            `;

            const itemParams = [
                user_id,
                title.trim(),
                description.trim(),
                category.trim(),
                condition,
                original_price || null,
                selling_price,
                expire_date
            ];

            const [itemResult] = await connection.execute(insertItemQuery, itemParams);
            createdItemId = itemResult.insertId;
            console.log('Created Item with ID:', createdItemId);

            // Step 2: Insert Listing record
            const insertListingQuery = `
                INSERT INTO Listing (
                    UID, ItemID, status, description,
                    available_from_date, expire_date, created_at
                ) VALUES (?, ?, 'active', ?, CURDATE(), ?, NOW())
            `;

            const listingParams = [
                user_id,
                createdItemId,
                condition_details || null,
                expire_date
            ];

            const [listingResult] = await connection.execute(insertListingQuery, listingParams);
            createdListId = listingResult.insertId;
            console.log('Created Listing with ID:', createdListId);

            // Step 3: Insert ListingMedia records for images
            for (let i = 0; i < imageFiles.length; i++) {
                const imageFile = imageFiles[i];
                const imageUrl = `http://localhost:3000/api/images/${imageFile.filename}`;
                const slot = i + 1;

                // Insert into ListingMedia table
                const insertMediaQuery = `
                    INSERT INTO ListingMedia (
                        ListID, media_type, url, thumbnail_url, alt_text, created_at
                    ) VALUES (?, 'image', ?, NULL, ?, NOW())
                `;

                const mediaParams = [
                    createdListId,
                    imageUrl,
                    `Image ${slot} of ${title.trim()}`
                ];

                const [mediaResult] = await connection.execute(insertMediaQuery, mediaParams);
                const mediaId = mediaResult.insertId;
                createdMediaIds.push(mediaId);

                // Insert into ListingMedia_Image table
                const insertImageQuery = `
                    INSERT INTO ListingMedia_Image (MediaID, slot, width_px, heigh_px)
                    VALUES (?, ?, NULL, NULL)
                `;

                await connection.execute(insertImageQuery, [mediaId, slot]);
                console.log(`Created ListingMedia_Image with MediaID: ${mediaId}, slot: ${slot}`);
            }

            // Step 4: Insert ListingMedia record for video (if uploaded)
            if (videoFile) {
                const videoUrl = `http://localhost:3000/api/videos/${videoFile.filename}`;

                // Insert into ListingMedia table
                const insertVideoMediaQuery = `
                    INSERT INTO ListingMedia (
                        ListID, media_type, url, thumbnail_url, alt_text, created_at
                    ) VALUES (?, 'video', ?, NULL, ?, NOW())
                `;

                const videoMediaParams = [
                    createdListId,
                    videoUrl,
                    `Video of ${title.trim()}`
                ];

                const [videoMediaResult] = await connection.execute(insertVideoMediaQuery, videoMediaParams);
                const videoMediaId = videoMediaResult.insertId;
                createdMediaIds.push(videoMediaId);

                // Insert into ListingMedia_Video table
                const insertVideoQuery = `
                    INSERT INTO ListingMedia_Video (MediaID, duration_sec, apt_no)
                    VALUES (?, NULL, NULL)
                `;

                await connection.execute(insertVideoQuery, [videoMediaId]);
                console.log(`Created ListingMedia_Video with MediaID: ${videoMediaId}`);
            }

            // Commit transaction
            await connection.commit();
            connection.release();

            console.log('Listing created successfully');

            return res.status(201).json({
                success: true,
                message: 'Listing created successfully',
                data: {
                    item_id: createdItemId,
                    list_id: createdListId,
                    media_count: createdMediaIds.length
                }
            });

        } catch (queryError) {
            // Rollback transaction on error
            await connection.rollback();
            connection.release();

            // Delete uploaded files on database error
            deleteUploadedFiles(imageFiles, videoFile);

            console.error('Query error during listing creation:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to create listing. Database error occurred.'
            });
        }

    } catch (error) {
        // Release connection if it exists
        if (connection) {
            try {
                await connection.rollback();
                connection.release();
            } catch (releaseError) {
                console.error('Error releasing connection:', releaseError);
            }
        }

        // Delete uploaded files on unexpected error
        deleteUploadedFiles(imageFiles, videoFile);

        console.error('Unexpected error during listing creation:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// =====================================================
// FUNCTION 6: Get price reference data for similar sold items
// =====================================================
// Endpoint: GET /api/listings/price-reference
// Query Parameters:
// - category: item category to match
// - condition: item condition to match
// Returns: array of similar SOLD items with prices (privacy-safe)
exports.getPriceReference = async (req, res) => {
    try {
        const { category, condition } = req.query;

        // Validate required parameters
        if (!category || !condition) {
            return res.status(400).json({
                success: false,
                message: 'Category and condition are required'
            });
        }

        console.log(`Fetching price reference for category: ${category}, condition: ${condition}`);

        let connection;
        try {
            connection = await pool.getConnection();
        } catch (dbError) {
            return res.status(503).json({
                success: false,
                message: 'Unable to connect to the database'
            });
        }

        try {
            // Query to fetch SOLD items with matching category and condition
            // Joins with Order table to get final transaction price
            // Privacy-safe: Only returns item info and price, no seller/buyer details
            const query = `
                SELECT
                    i.ItemID,
                    i.title,
                    i.category,
                    i.condition,
                    i.original_price,
                    o.price as sold_price,
                    (
                        SELECT m.url
                        FROM ListingMedia m
                        LEFT JOIN ListingMedia_Image mi ON m.MediaID = mi.MediaID
                        WHERE m.ListID = l.ListID AND m.media_type = 'image'
                        ORDER BY mi.slot ASC, m.created_at ASC
                        LIMIT 1
                    ) as cover_image
                FROM Item i
                JOIN Listing l ON i.ItemID = l.ItemID
                JOIN \`Order\` o ON l.ListID = o.ListID
                WHERE i.category = ?
                  AND i.condition = ?
                  AND (l.status = 'Sold' OR o.status = 'COMPLETED')
                ORDER BY o.created_at DESC
                LIMIT 10
            `;

            const [rows] = await connection.execute(query, [category, condition]);
            connection.release();

            // Format response data
            const referenceItems = rows.map(row => ({
                ItemID: row.ItemID,
                title: row.title,
                category: row.category,
                condition: row.condition,
                original_price: row.original_price,
                sold_price: row.sold_price,
                cover_image: row.cover_image
            }));

            return res.status(200).json({
                success: true,
                message: 'Price reference fetched successfully',
                data: referenceItems,
                count: referenceItems.length
            });

        } catch (queryError) {
            connection.release();
            console.error('Query error:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to fetch price reference'
            });
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// =====================================================
// HELPER FUNCTION: Delete uploaded files on error
// =====================================================
// Cleans up uploaded files when listing creation fails
// Prevents orphan files from accumulating on disk
function deleteUploadedFiles(imageFiles, videoFile) {
    try {
        // Delete image files
        if (imageFiles && imageFiles.length > 0) {
            imageFiles.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log(`Deleted orphan image file: ${file.filename}`);
                }
            });
        }

        // Delete video file
        if (videoFile && fs.existsSync(videoFile.path)) {
            fs.unlinkSync(videoFile.path);
            console.log(`Deleted orphan video file: ${videoFile.filename}`);
        }
    } catch (error) {
        console.error('Error deleting uploaded files:', error);
    }
}
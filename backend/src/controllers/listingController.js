const pool = require('../config/database');

// FUNCTION 1: Get all active listings with images and seller information
// ENHANCEMENT: Added seller_uid for MessageDialog functionality
exports.getAllListings = async (req, res) => {
    try {
        console.log('Fetching all listings from database');

        // Attempt to get database connection
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
            // SQL query to fetch listings with related information
            // FIXED: Added l.UID as seller_uid for messaging functionality
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
                    m.url as image_url
                FROM Listing l
                         JOIN Item i ON l.ItemID = i.ItemID
                         JOIN User u ON l.UID = u.UID
                         LEFT JOIN ListingMedia m ON l.ListID = m.ListID AND m.media_type = 'image'
                WHERE l.status = 'active'
                ORDER BY l.created_at DESC, m.created_at ASC
                    LIMIT 50
            `;

            const [rows] = await connection.execute(query);
            connection.release();

            // Group images by listing ID for proper formatting
            const listingsMap = new Map();
            rows.forEach(row => {
                if (!listingsMap.has(row.ListID)) {
                    listingsMap.set(row.ListID, {
                        ListID: row.ListID,
                        ItemID: row.ItemID,
                        title: row.title,
                        selling_price: parseFloat(row.selling_price),
                        original_price: row.original_price ? parseFloat(row.original_price) : null,
                        status: row.status,
                        expire_date: row.expire_date,
                        seller_uid: row.seller_uid,
                        seller_name: row.seller_name,
                        images: [],
                        cover_image: null
                    });
                }
                // Add image URL to listing's image array
                if (row.image_url) {
                    listingsMap.get(row.ListID).images.push(row.image_url);
                }
            });

            // Set cover_image to first image in array
            listingsMap.forEach(listing => {
                if (listing.images.length > 0) {
                    listing.cover_image = listing.images[0];
                }
            });

            const listings = Array.from(listingsMap.values());

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
                message: 'Unable to fetch listings from database'
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

// FUNCTION 2: Get specific listing details by listing ID
exports.getListingById = async (req, res) => {
    try {
        const { listingId } = req.params;
        console.log(`Fetching listing details for ListID: ${listingId}`);

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
            // Query to fetch specific listing with all details
            const query = `
                SELECT
                    l.ListID,
                    l.ItemID,
                    l.UID as seller_uid,
                    i.title,
                    i.description as item_description,
                    i.category,
                    i.condition,
                    i.original_price,
                    i.selling_price,
                    l.status,
                    l.description as listing_description,
                    l.expire_date,
                    l.available_from_date,
                    u.UID as seller_uid,
                    u.name as seller_name,
                    u.email as seller_email,
                    u.phone as seller_phone,
                    m.MediaID as media_id,
                    m.url as image_url,
                    m.media_type,
                    m.thumbnail_url,
                    m.alt_text,
                    m.created_at as media_created_at
                FROM Listing l
                         JOIN Item i ON l.ItemID = i.ItemID
                         JOIN User u ON l.UID = u.UID
                         LEFT JOIN ListingMedia m ON l.ListID = m.ListID
                WHERE l.ListID = ? AND l.status = 'active'
                ORDER BY m.created_at ASC
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
                    email: firstRow.seller_email
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
                seller_phone: firstRow.seller_phone,
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
                        listing.media.images.push(mediaItem);
                    } else if (row.media_type === 'video') {
                        listing.videos.push(row.image_url);
                        mediaItem.thumbnail = row.image_url;
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

// FUNCTION 3: Get all listings posted by a specific seller
// FIXED: Added seller_uid to query and response
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
            // Query to fetch all listings posted by a specific user
            // FIXED: Added l.UID as seller_uid
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
                    m.url as image_url
                FROM Listing l
                         JOIN Item i ON l.ItemID = i.ItemID
                         JOIN User u ON l.UID = u.UID
                         LEFT JOIN ListingMedia m ON l.ListID = m.ListID AND m.media_type = 'image'
                WHERE l.UID = ?
                ORDER BY l.created_at DESC, m.created_at ASC
            `;

            const [rows] = await connection.execute(query, [userId]);
            connection.release();

            // Group results by listing ID
            const listingsMap = new Map();
            rows.forEach(row => {
                if (!listingsMap.has(row.ListID)) {
                    listingsMap.set(row.ListID, {
                        ListID: row.ListID,
                        ItemID: row.ItemID,
                        title: row.title,
                        selling_price: parseFloat(row.selling_price),
                        original_price: row.original_price ? parseFloat(row.original_price) : null,
                        status: row.status,
                        expire_date: row.expire_date,
                        seller_uid: row.seller_uid,
                        seller_name: row.seller_name,
                        images: [],
                        cover_image: null
                    });
                }
                if (row.image_url) {
                    listingsMap.get(row.ListID).images.push(row.image_url);
                }
            });

            // Set cover_image to first image in array
            listingsMap.forEach(listing => {
                if (listing.images.length > 0) {
                    listing.cover_image = listing.images[0];
                }
            });

            const listings = Array.from(listingsMap.values());

            return res.status(200).json({
                success: true,
                message: 'User listings fetched successfully',
                data: listings,
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
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
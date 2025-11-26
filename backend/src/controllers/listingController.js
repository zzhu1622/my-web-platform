const pool = require('../config/database');

// FUNCTION 1: Get all active listings with search, filter, and sort capabilities
// ENHANCEMENT: Added support for keyword search, category filter, and sorting options
exports.getAllListings = async (req, res) => {
    try {
        console.log('Fetching listings with filters from database');

        // Extract query parameters from request
        // searchKeyword: keyword to search in item title (case-insensitive partial match)
        // category: filter listings by specific item category
        // sortBy: determines sorting field (price or expire_date)
        // sortOrder: determines sort direction (asc for ascending, desc for descending)
        const { searchKeyword, category, sortBy, sortOrder } = req.query;

        console.log('Applied filters:', { searchKeyword, category, sortBy, sortOrder });

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
            // Base SQL query to fetch listings with related information
            // Joins Listing, Item, User, and ListingMedia tables
            let query = `
                SELECT
                    l.ListID,
                    l.ItemID,
                    l.UID as seller_uid,
                    i.title,
                    i.category,
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
            `;

            // Array to store query parameters for prepared statement
            const queryParams = [];

            // Add search keyword filter if provided
            // Uses LIKE operator with wildcards for partial matching
            // Case-insensitive search on item title
            if (searchKeyword && searchKeyword.trim() !== '') {
                query += ` AND i.title LIKE ?`;
                queryParams.push(`%${searchKeyword.trim()}%`);
            }

            // Add category filter if provided
            // Exact match on category field
            if (category && category.trim() !== '') {
                query += ` AND i.category = ?`;
                queryParams.push(category.trim());
            }

            // Determine sorting field and direction
            // Default sort by created_at DESC if no sort parameters provided
            let orderByClause = 'ORDER BY l.created_at DESC, m.created_at ASC';

            if (sortBy && sortOrder) {
                // Validate sortOrder to prevent SQL injection
                const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

                // Apply sorting based on sortBy parameter
                switch (sortBy) {
                    case 'price':
                        // Sort by selling price (low to high or high to low)
                        orderByClause = `ORDER BY i.selling_price ${validSortOrder}, l.created_at DESC, m.created_at ASC`;
                        break;

                    case 'expire_date':
                        // Sort by expiration date (near to far or far to near)
                        orderByClause = `ORDER BY l.expire_date ${validSortOrder}, l.created_at DESC, m.created_at ASC`;
                        break;

                    default:
                        // Keep default sorting if sortBy is invalid
                        break;
                }
            }

            // Append ORDER BY clause and LIMIT to final query
            query += ` ${orderByClause} LIMIT 50`;

            console.log('Executing query:', query);
            console.log('Query parameters:', queryParams);

            // Execute query with parameters
            const [rows] = await connection.execute(query, queryParams);
            connection.release();

            console.log(`Retrieved ${rows.length} rows from database`);

            // Group images by listing ID for proper formatting
            // Each listing can have multiple images, but we need to return each listing once
            const listingsMap = new Map();
            rows.forEach(row => {
                if (!listingsMap.has(row.ListID)) {
                    listingsMap.set(row.ListID, {
                        ListID: row.ListID,
                        ItemID: row.ItemID,
                        title: row.title,
                        category: row.category,
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

            // Set cover_image to first image in array for each listing
            listingsMap.forEach(listing => {
                if (listing.images.length > 0) {
                    listing.cover_image = listing.images[0];
                }
            });

            // Convert Map to Array for JSON response
            const listings = Array.from(listingsMap.values());

            return res.status(200).json({
                success: true,
                message: 'Listings fetched successfully',
                data: listings,
                count: listings.length,
                filters: {
                    searchKeyword: searchKeyword || null,
                    category: category || null,
                    sortBy: sortBy || null,
                    sortOrder: sortOrder || null
                }
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

// FUNCTION 2: Get all unique categories from items in database
// Used to populate category filter dropdown with actual categories
exports.getCategories = async (req, res) => {
    try {
        console.log('Fetching all unique categories from database');

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
            // Query to get distinct categories from Item table
            // Only includes categories from active listings
            const query = `
                SELECT DISTINCT i.category
                FROM Item i
                         JOIN Listing l ON i.ItemID = l.ItemID
                WHERE l.status = 'active'
                ORDER BY i.category ASC
            `;

            const [rows] = await connection.execute(query);
            connection.release();

            // Extract category values into simple array
            const categories = rows.map(row => row.category);

            return res.status(200).json({
                success: true,
                message: 'Categories fetched successfully',
                data: categories,
                count: categories.length
            });

        } catch (queryError) {
            connection.release();
            console.error('Query error:', queryError);
            return res.status(503).json({
                success: false,
                message: 'Unable to fetch categories from database'
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

// FUNCTION 3: Get specific listing details by listing ID
// No changes from original implementation
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

// FUNCTION 4: Get all listings posted by a specific seller
// No changes from original implementation
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
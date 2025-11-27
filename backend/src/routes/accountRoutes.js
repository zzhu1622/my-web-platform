// File: backend/src/routes/accountRoutes.js
// Purpose: Defines all API endpoints for the "My Account" page
// All routes are prefixed with /api/account in the main server file

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// =====================================================
// USER PROFILE ROUTE
// =====================================================
// Endpoint: GET /api/account/profile/:uid
// Purpose: Retrieve user profile information for Personal Information tab
// URL Parameters: uid - User ID
// Response: { success: boolean, user: object }
// Returns: UID, name, email, phone, move_out_date (excludes password hash)
router.get('/profile/:uid', accountController.getUserProfile);

// =====================================================
// USER OVERVIEW ROUTE
// =====================================================
// Endpoint: GET /api/account/overview/:uid
// Purpose: Retrieve user overview data including public info and reviews received
// URL Parameters: uid - User ID (seller)
// Response: { success: boolean, user: object, reviews: array, stats: object }
// Note: Reviews are those received by the user as a seller (hides reviewer identity)
router.get('/overview/:uid', accountController.getUserOverview);

// =====================================================
// CHANGE PASSWORD ROUTE
// =====================================================
// Endpoint: POST /api/account/change-password
// Purpose: Update user password after verifying old password
// Request Body: { uid, old_password, new_password, confirm_password }
// Response: { success: boolean, message: string }
// Validation:
//   1. old_password must match current password
//   2. new_password must match confirm_password
//   3. new_password must meet policy (min 6 chars)
router.post('/change-password', accountController.changePassword);

// =====================================================
// GET USER LISTINGS ROUTE
// =====================================================
// Endpoint: GET /api/account/listings/:uid
// Purpose: Retrieve all listings posted by user for Listing Management tab
// URL Parameters: uid - User ID (seller)
// Response: { success: boolean, listings: array, count: number }
router.get('/listings/:uid', accountController.getUserListings);

// =====================================================
// GET LISTING FOR EDIT ROUTE
// =====================================================
// Endpoint: GET /api/account/listings/edit/:listId
// Purpose: Retrieve full listing details for edit form pre-fill
// URL Parameters: listId - Listing ID
// Query Parameters: uid - User ID for ownership verification
// Response: { success: boolean, listing: object, media: array }
router.get('/listings/edit/:listId', accountController.getListingForEdit);

// =====================================================
// UPDATE LISTING ROUTE
// =====================================================
// Endpoint: PUT /api/account/listings/:listId
// Purpose: Update listing and item details
// URL Parameters: listId - Listing ID
// Request Body: { uid, title, category, condition, description, 
//                 selling_price, original_price, expire_date, condition_details }
// Response: { success: boolean, message: string }
router.put('/listings/:listId', accountController.updateListing);

// =====================================================
// DELETE LISTING ROUTE
// =====================================================
// Endpoint: DELETE /api/account/listings/:listId
// Purpose: Delete a listing along with its item and media
// URL Parameters: listId - Listing ID to delete
// Query Parameters: uid - User ID for ownership verification
// Response: { success: boolean, message: string }
// Validation:
//   1. Listing must belong to requesting user
//   2. No orders exist for this listing
router.delete('/listings/:listId', accountController.deleteListing);

module.exports = router;

// File: frontend/src/services/accountService.js
// Purpose: Handles all account-related API calls for the "My Account" page
// Features: User profile, password change, listing management, reviews

import axios from 'axios';

// Get API URL from environment variables (.env file)
const API_URL = import.meta.env.VITE_API_URL;

const accountService = {

    // =====================================================
    // GET USER PROFILE
    // =====================================================
    // Purpose: Fetch user profile data for Personal Information tab
    // Parameter: uid - User ID
    // Returns: { success: boolean, user: object }
    // User object contains: UID, name, email, phone, move_out_date
    getUserProfile: async (uid) => {
        try {
            const response = await axios.get(`${API_URL}/account/profile/${uid}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch user profile'
            };
        }
    },

    // =====================================================
    // GET USER OVERVIEW
    // =====================================================
    // Purpose: Fetch user overview data including public info and reviews received
    // Parameter: uid - User ID (seller)
    // Returns: { success: boolean, user: object, reviews: array, stats: object }
    // Note: Reviews are those received by the user as a seller (hides reviewer identity)
    getUserOverview: async (uid) => {
        try {
            const response = await axios.get(`${API_URL}/account/overview/${uid}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user overview:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch user overview'
            };
        }
    },

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================
    // Purpose: Update user password after verifying old password
    // Parameters:
    //   - uid: User ID
    //   - old_password: Current password for verification
    //   - new_password: New password to set
    //   - confirm_password: Confirmation of new password
    // Returns: { success: boolean, message: string }
    changePassword: async (uid, old_password, new_password, confirm_password) => {
        try {
            const response = await axios.post(`${API_URL}/account/change-password`, {
                uid,
                old_password,
                new_password,
                confirm_password
            });
            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to change password'
            };
        }
    },

    // =====================================================
    // GET USER LISTINGS
    // =====================================================
    // Purpose: Fetch all listings posted by user for Listing Management tab
    // Parameter: uid - User ID (seller)
    // Returns: { success: boolean, listings: array, count: number }
    // Each listing contains: list_id, item_id, title, category, condition,
    //   prices, listing_status, cover_image, expire_date, can_edit, can_delete
    getUserListings: async (uid) => {
        try {
            const response = await axios.get(`${API_URL}/account/listings/${uid}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user listings:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch listings',
                listings: [],
                count: 0
            };
        }
    },

    // =====================================================
    // GET LISTING FOR EDIT
    // =====================================================
    // Purpose: Fetch full listing details for edit form pre-fill
    // Parameters:
    //   - listId: Listing ID to edit
    //   - uid: User ID for ownership verification
    // Returns: { success: boolean, listing: object, media: array }
    getListingForEdit: async (listId, uid) => {
        try {
            const response = await axios.get(`${API_URL}/account/listings/edit/${listId}`, {
                params: { uid }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching listing for edit:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch listing details'
            };
        }
    },

    // =====================================================
    // UPDATE LISTING
    // =====================================================
    // Purpose: Update listing and item details
    // Parameters:
    //   - listId: Listing ID to update
    //   - listingData: Object containing:
    //     - uid: User ID
    //     - title: Item title
    //     - category: Item category
    //     - condition: Item condition (like_new, good, fair, poor)
    //     - description: Item description
    //     - selling_price: Asking price
    //     - original_price: Original price (optional)
    //     - expire_date: Listing expiration date
    //     - condition_details: Additional condition details (optional)
    // Returns: { success: boolean, message: string }
    updateListing: async (listId, listingData) => {
        try {
            const response = await axios.put(`${API_URL}/account/listings/${listId}`, listingData);
            return response.data;
        } catch (error) {
            console.error('Error updating listing:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update listing'
            };
        }
    },

    // =====================================================
    // DELETE LISTING
    // =====================================================
    // Purpose: Delete a listing along with its item and media
    // Parameters:
    //   - listId: Listing ID to delete
    //   - uid: User ID for ownership verification
    // Returns: { success: boolean, message: string }
    // Note: Will fail if listing has any orders (has been purchased)
    deleteListing: async (listId, uid) => {
        try {
            const response = await axios.delete(`${API_URL}/account/listings/${listId}`, {
                params: { uid }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting listing:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete listing'
            };
        }
    }
};

export default accountService;

const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

// GET all listings
router.get('/', listingController.getAllListings);

// GET listing by ID
router.get('/:listingId', listingController.getListingById);

// GET user's listings
router.get('/user/:userId', listingController.getUserListings);

module.exports = router;
const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/explore');

router.get('/', exploreController.getExplore);
router.get('/trip/:id', exploreController.getExploreTripDetail);

router.get('/featured', exploreController.getFeaturedTrips);
router.get('/public', exploreController.getPublicTrips);

module.exports = router;

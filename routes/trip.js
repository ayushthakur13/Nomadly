const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip');

router.get('/', tripController.getTrips);
router.get('/details/:tripId', tripController.getTripDetails);
router.get('/create', tripController.getCreateTrip);
router.post('/create', tripController.postCreateTrip);

module.exports = router;

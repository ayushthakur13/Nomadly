const express = require('express');
const router = express.Router();
const requireAuth = require('../../middlewares/requireAuth');
const tripsController = require('../../controllers/api/trips');
const { uploadTripCover } = require('../../middlewares/multer');

// All routes require authentication
router.use(requireAuth);

// Trip CRUD operations
router.get('/', tripsController.getUserTrips);
router.post('/', tripsController.createTrip);
router.get('/:tripId', tripsController.getTripById);
router.put('/:tripId', tripsController.updateTrip);
router.delete('/:tripId', tripsController.deleteTrip);

// Trip cover image
router.post('/:tripId/cover', uploadTripCover.single('image'), tripsController.updateTripCover);
router.delete('/:tripId/cover', tripsController.deleteTripCover);

// Trip status and publishing
router.patch('/:tripId/publish', tripsController.publishTrip);
router.patch('/:tripId/unpublish', tripsController.unpublishTrip);

// Trip cloning
router.post('/:tripId/clone', tripsController.cloneTrip);

module.exports = router;
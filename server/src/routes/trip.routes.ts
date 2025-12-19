import express from 'express';
import tripController from '../controllers/trip.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { uploadTripCover } from '../middlewares/multer';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

// PUBLIC ROUTES
router.get('/search-location', asyncHandler(tripController.searchLocation.bind(tripController)));
router.get('/public', asyncHandler(tripController.getPublicTrips.bind(tripController)));

// PROTECTED ROUTES
router.use(authMiddleware);

// Trip CRUD operations
router.get('/', asyncHandler(tripController.getUserTrips.bind(tripController)));
router.post('/', asyncHandler(tripController.createTrip.bind(tripController)));
router.get('/:tripId', asyncHandler(tripController.getTripById.bind(tripController)));
router.put('/:tripId', asyncHandler(tripController.updateTrip.bind(tripController)));
router.delete('/:tripId', asyncHandler(tripController.deleteTrip.bind(tripController)));

// Trip cover image
router.post('/:tripId/cover', uploadTripCover.single('image'), asyncHandler(tripController.updateTripCover.bind(tripController)));
router.delete('/:tripId/cover', asyncHandler(tripController.deleteTripCover.bind(tripController)));

// Trip status and publishing
router.patch('/:tripId/publish', asyncHandler(tripController.publishTrip.bind(tripController)));
router.patch('/:tripId/unpublish', asyncHandler(tripController.unpublishTrip.bind(tripController)));

// Trip cloning
router.post('/:tripId/clone', asyncHandler(tripController.cloneTrip.bind(tripController)));

export default router;
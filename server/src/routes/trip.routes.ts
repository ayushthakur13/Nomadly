import express from 'express';
import tripController from '../controllers/trip.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { uploadTripCover } from '../middlewares/multer';

const router = express.Router();

// PUBLIC ROUTES
router.get('/search-location', tripController.searchLocation as any);
router.get('/public', tripController.getPublicTrips as any);

// PROTECTED ROUTES
router.use(authMiddleware);

// Trip CRUD operations
router.get('/', tripController.getUserTrips as any);
router.post('/', tripController.createTrip as any);
router.get('/:tripId', tripController.getTripById as any);
router.put('/:tripId', tripController.updateTrip as any);
router.delete('/:tripId', tripController.deleteTrip as any);

// Trip cover image
router.post('/:tripId/cover', uploadTripCover.single('image'), tripController.updateTripCover as any);
router.delete('/:tripId/cover', tripController.deleteTripCover as any);

// Trip status and publishing
router.patch('/:tripId/publish', tripController.publishTrip as any);
router.patch('/:tripId/unpublish', tripController.unpublishTrip as any);

// Trip cloning
router.post('/:tripId/clone', tripController.cloneTrip as any);

export default router;
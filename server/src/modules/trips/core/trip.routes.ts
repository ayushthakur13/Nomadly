import express from 'express';
import tripController from './trip.controller';
import authMiddleware from '../../auth/auth.middleware';
import { uploadTripCover } from '../../../shared/middlewares/multer';
import asyncHandler from '../../../shared/utils/asyncHandler';

const router = express.Router();

router.get('/search-location', asyncHandler(tripController.searchLocation.bind(tripController)));
router.get('/public', asyncHandler(tripController.getPublicTrips.bind(tripController)));

router.use(authMiddleware);

router.get('/', asyncHandler(tripController.getUserTrips.bind(tripController)));
router.post('/', asyncHandler(tripController.createTrip.bind(tripController)));
router.get('/:tripId', asyncHandler(tripController.getTripById.bind(tripController)));
router.put('/:tripId', asyncHandler(tripController.updateTrip.bind(tripController)));
router.delete('/:tripId', asyncHandler(tripController.deleteTrip.bind(tripController)));

router.post('/:tripId/cover', uploadTripCover.single('image'), asyncHandler(tripController.updateTripCover.bind(tripController)));
router.delete('/:tripId/cover', asyncHandler(tripController.deleteTripCover.bind(tripController)));

router.patch('/:tripId/publish', asyncHandler(tripController.publishTrip.bind(tripController)));
router.patch('/:tripId/unpublish', asyncHandler(tripController.unpublishTrip.bind(tripController)));

router.post('/:tripId/clone', asyncHandler(tripController.cloneTrip.bind(tripController)));

export default router;

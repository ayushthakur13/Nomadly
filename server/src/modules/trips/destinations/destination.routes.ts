import express from 'express';
import destinationController from './destination.controller';
import { authMiddleware, optionalAuthMiddleware, uploadDestination, validate } from '@shared/middlewares';
import { asyncHandler } from '@shared/utils';
import { createDestinationSchema, updateDestinationSchema, reorderDestinationsSchema } from './destination.schema';

const router = express.Router({ mergeParams: true });

// Trip-scoped routes (mounted at /trips/:tripId/destinations)
router.get(
  '/',
  optionalAuthMiddleware,
  asyncHandler(destinationController.getDestinations.bind(destinationController))
);

// All other routes require authentication
router.use(authMiddleware);

router.post(
  '/',
  validate(createDestinationSchema),
  asyncHandler(destinationController.createDestination.bind(destinationController))
);

router.patch(
  '/reorder',
  validate(reorderDestinationsSchema),
  asyncHandler(destinationController.reorderDestinations.bind(destinationController))
);

// Create a separate router for destination-specific routes
export const destinationItemRouter = express.Router();
destinationItemRouter.use(authMiddleware);

destinationItemRouter.patch(
  '/:destinationId',
  validate(updateDestinationSchema),
  asyncHandler(destinationController.updateDestination.bind(destinationController))
);

destinationItemRouter.delete(
  '/:destinationId',
  asyncHandler(destinationController.deleteDestination.bind(destinationController))
);

destinationItemRouter.post(
  '/:destinationId/image',
  uploadDestination.single('image'),
  asyncHandler(destinationController.uploadImage.bind(destinationController))
);

destinationItemRouter.delete(
  '/:destinationId/image',
  asyncHandler(destinationController.deleteImage.bind(destinationController))
);

export default router;

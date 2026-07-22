import express from 'express';
import memoryController from './memory.controller';
import { authMiddleware, optionalAuthMiddleware, uploadMemory, validate } from '@shared/middlewares';
import { asyncHandler } from '@shared/utils';
import { updateMemorySchema } from './memory.schema';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  optionalAuthMiddleware,
  asyncHandler(memoryController.getMemories.bind(memoryController))
);

// All other scoped trip memory routes require auth
router.use(authMiddleware);

router.post(
  '/',
  uploadMemory.single('image'),
  asyncHandler(memoryController.uploadMemory.bind(memoryController))
);

// Router for individual memory item updates/deletions
export const memoryItemRouter = express.Router();
memoryItemRouter.use(authMiddleware);

memoryItemRouter.patch(
  '/:memoryId',
  validate(updateMemorySchema),
  asyncHandler(memoryController.updateCaption.bind(memoryController))
);

memoryItemRouter.delete(
  '/:memoryId',
  asyncHandler(memoryController.deleteMemory.bind(memoryController))
);

export default router;

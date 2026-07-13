import express from 'express';
import memoryController from './memory.controller';
import { authMiddleware, uploadMemory } from '@shared/middlewares';
import { asyncHandler } from '@shared/utils';

const router = express.Router({ mergeParams: true });

// All scoped trip memory routes require auth
router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(memoryController.getMemories.bind(memoryController))
);

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
  asyncHandler(memoryController.updateCaption.bind(memoryController))
);

memoryItemRouter.delete(
  '/:memoryId',
  asyncHandler(memoryController.deleteMemory.bind(memoryController))
);

export default router;

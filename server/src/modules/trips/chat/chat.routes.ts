import express from 'express';
import chatController from './chat.controller';
import { authMiddleware } from '@shared/middlewares';
import { asyncHandler } from '@shared/utils';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get(
  '/messages',
  asyncHandler(chatController.getMessages.bind(chatController))
);

export default router;

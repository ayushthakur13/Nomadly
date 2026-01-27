import express from 'express';
import taskController from './task.controllers';
import { authMiddleware } from '@shared/middlewares';
import { asyncHandler } from '@shared/utils';

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(authMiddleware);

// Trip-scoped routes (mounted at /trips/:tripId/tasks)
router.get(
  '/',
  asyncHandler(taskController.getTasks.bind(taskController))
);

router.post(
  '/',
  asyncHandler(taskController.createTask.bind(taskController))
);

// Create a separate router for task-specific routes
export const taskItemRouter = express.Router();
taskItemRouter.use(authMiddleware);

taskItemRouter.patch(
  '/:taskId',
  asyncHandler(taskController.updateTask.bind(taskController))
);

taskItemRouter.delete(
  '/:taskId',
  asyncHandler(taskController.deleteTask.bind(taskController))
);

taskItemRouter.post(
  '/:taskId/complete',
  asyncHandler(taskController.completeTask.bind(taskController))
);

taskItemRouter.delete(
  '/:taskId/complete',
  asyncHandler(taskController.uncompleteTask.bind(taskController))
);

export default router;
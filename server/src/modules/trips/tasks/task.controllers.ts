import { Request, Response, NextFunction } from 'express';
import taskService from './task.service';
import { CreateTaskDTO, UpdateTaskDTO } from '../../../../../shared/types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class TaskController {
  /**
   * GET /api/trips/:tripId/tasks
   * Get all tasks for a trip
   */
  async getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;
      const includeArchived = req.query.includeArchived === 'true';

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const tasks = await taskService.getTasksByTripId(tripId, userId, includeArchived);

      res.status(200).json({
        success: true,
        data: { tasks }
      });
    } catch (error: any) {
      if (error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to view tasks') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Invalid trip ID') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/trips/:tripId/tasks
   * Create a new task
   */
  async createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const { title, description, assignedTo, dueDate } = req.body as Partial<CreateTaskDTO>;

      if (!title || !title.trim()) {
        res.status(400).json({ success: false, message: 'Task title is required' });
        return;
      }

      const payload: CreateTaskDTO = { title } as CreateTaskDTO;
      if (description !== undefined) payload.description = description as string;
      if (assignedTo !== undefined) payload.assignedTo = assignedTo as string[] | null;
      if (dueDate !== undefined) payload.dueDate = dueDate as string | Date;

      const task = await taskService.createTask(tripId, userId, payload);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task }
      });
    } catch (error: any) {
      if (error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Unauthorized to create tasks in this trip' ||
        error.message === 'All assigned users must be trip members'
      ) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Invalid trip ID' ||
        error.message === 'Invalid user ID in assignedTo'
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:taskId
   * Update a task
   */
  async updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!taskId) {
        res.status(400).json({ success: false, message: 'Task ID is required' });
        return;
      }

      const { title, description, assignedTo, dueDate } = req.body as Partial<UpdateTaskDTO>;

      const payload: UpdateTaskDTO = {} as UpdateTaskDTO;
      if (title !== undefined) payload.title = title as string;
      if (description !== undefined) payload.description = description as string;
      if (assignedTo !== undefined) payload.assignedTo = assignedTo as string[] | null;
      if (dueDate !== undefined) payload.dueDate = dueDate as string | Date;

      const task = await taskService.updateTask(taskId, userId, payload);

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: { task }
      });
    } catch (error: any) {
      if (error.message === 'Task not found' || error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Unauthorized to edit this task' ||
        error.message === 'All assigned users must be trip members'
      ) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Invalid task ID' ||
        error.message === 'Invalid user ID in assignedTo'
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/:taskId
   * Delete (archive) a task
   */
  async deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!taskId) {
        res.status(400).json({ success: false, message: 'Task ID is required' });
        return;
      }

      await taskService.deleteTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      if (error.message === 'Task not found' || error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to delete this task') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Invalid task ID') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/tasks/:taskId/complete
   * Mark task as complete for the requesting user
   */
  async completeTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!taskId) {
        res.status(400).json({ success: false, message: 'Task ID is required' });
        return;
      }

      const task = await taskService.completeTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: 'Task marked as complete',
        data: { task }
      });
    } catch (error: any) {
      if (error.message === 'Task not found' || error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Unauthorized to complete this task' ||
        error.message === 'Task already completed by this user'
      ) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Invalid task ID') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/:taskId/complete
   * Remove completion for the requesting user
   */
  async uncompleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!taskId) {
        res.status(400).json({ success: false, message: 'Task ID is required' });
        return;
      }

      const task = await taskService.uncompleteTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: 'Task completion removed',
        data: { task }
      });
    } catch (error: any) {
      if (error.message === 'Task not found' || error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Unauthorized to modify completion for this task' ||
        error.message === 'Task not completed by this user'
      ) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Invalid task ID') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

export default new TaskController();

import { Types } from 'mongoose';
import Task, { ITask } from './task.model';
import Trip, { ITrip } from '../core/trip.model';
import {
  canViewTasks,
  canCreateTask,
  canEditTask,
  canDeleteTask,
  canCompleteTask,
  validateAssignedUsers,
  hasUserCompletedTask
} from './task.permissions';
import { CreateTaskDTO, UpdateTaskDTO } from '../../../../../shared/types';

class TaskService {
  /**
   * Get all tasks for a trip
   * Returns all visible tasks regardless of assignment (UI handles action filtering)
   * 
   * @param tripId The trip ID
   * @param userId The requesting user ID
   * @param includeArchived Whether to include archived tasks (default: false)
   */
  async getTasksByTripId(
    tripId: string,
    userId: string,
    includeArchived: boolean = false
  ): Promise<ITask[]> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }

    const trip = await this.getTripOrThrow(tripId);

    // Check if user can view tasks
    if (!canViewTasks(trip, userId)) {
      throw new Error('Unauthorized to view tasks');
    }

    // Build query
    const query: any = { tripId: new Types.ObjectId(tripId) };
    
    if (!includeArchived) {
      query.isArchived = false;
    }

    // Fetch tasks sorted by creation date (newest first)
    const tasks = await Task.find(query)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email')
      .populate('completions.userId', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    return tasks;
  }

  /**
   * Create a new task
   * 
   * @param tripId The trip ID
   * @param userId The user creating the task
   * @param data Task creation data
   */
  async createTask(
    tripId: string,
    userId: string,
    data: CreateTaskDTO
  ): Promise<ITask> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }

    const trip = await this.getTripOrThrow(tripId);

    // Check if user can create tasks
    if (!canCreateTask(trip, userId)) {
      throw new Error('Unauthorized to create tasks in this trip');
    }

    // Normalize assignedTo: [] → null (assigned to everyone)
    let normalizedAssignedTo: Types.ObjectId[] | null = null;
    
    if (data.assignedTo && data.assignedTo.length > 0) {
      // Convert to ObjectIds
      const assignedToObjectIds = data.assignedTo.map((id: string) => {
        if (!Types.ObjectId.isValid(id)) {
          throw new Error('Invalid user ID in assignedTo');
        }
        return new Types.ObjectId(id);
      });
      
      // Validate all assigned users are trip members
      if (!validateAssignedUsers(trip, assignedToObjectIds)) {
        throw new Error('All assigned users must be trip members');
      }
      
      normalizedAssignedTo = assignedToObjectIds;
    }

    // Create task
    const task = new Task({
      tripId: new Types.ObjectId(tripId),
      title: data.title,
      description: data.description,
      assignedTo: normalizedAssignedTo,
      createdBy: new Types.ObjectId(userId),
      dueDate: data.dueDate ? new Date(data.dueDate as any) : undefined,
      completions: [],
      isArchived: false
    });

    await task.save();
    
    // Populate before returning
    await task.populate('createdBy', 'username email');
    await task.populate('assignedTo', 'username email');

    return task;
  }

  /**
   * Update task metadata
   * Only task creator or trip creator can update
   * 
   * @param taskId The task ID
   * @param userId The user requesting the update
   * @param data Task update data
   */
  async updateTask(
    taskId: string,
    userId: string,
    data: UpdateTaskDTO
  ): Promise<ITask> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const task = await this.getTaskOrThrow(taskId);
    const trip = await this.getTripOrThrow(task.tripId.toString());

    // Check if user can edit this task
    if (!canEditTask(trip, task, userId)) {
      throw new Error('Unauthorized to edit this task');
    }

    // Handle assignedTo update
    if (data.assignedTo !== undefined) {
      let normalizedAssignedTo: Types.ObjectId[] | null = null;
      
      if (data.assignedTo && data.assignedTo.length > 0) {
        // Convert to ObjectIds
        const assignedToObjectIds = data.assignedTo.map((id: string) => {
          if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID in assignedTo');
          }
          return new Types.ObjectId(id);
        });
        
        // Validate all assigned users are trip members
        if (!validateAssignedUsers(trip, assignedToObjectIds)) {
          throw new Error('All assigned users must be trip members');
        }
        
        normalizedAssignedTo = assignedToObjectIds;
      }
      
      // If assignedTo changed, remove completions for users no longer assigned
      if (normalizedAssignedTo !== null) {
        const assignedUserIds = normalizedAssignedTo.map(id => id.toString());
        task.completions = task.completions.filter(completion =>
          assignedUserIds.includes(completion.userId.toString())
        );
      }
      
      task.assignedTo = normalizedAssignedTo as any;
    }

    // Update other fields
    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.dueDate !== undefined && data.dueDate) {
      task.dueDate = new Date(data.dueDate as any);
    }

    await task.save();
    
    // Populate before returning
    await task.populate('createdBy', 'username email');
    await task.populate('assignedTo', 'username email');
    await task.populate('completions.userId', 'username email');

    return task;
  }

  /**
   * Soft delete a task (set isArchived = true)
   * Only task creator or trip creator can delete
   * 
   * @param taskId The task ID
   * @param userId The user requesting the deletion
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const task = await this.getTaskOrThrow(taskId);
    const trip = await this.getTripOrThrow(task.tripId.toString());

    // Check if user can delete this task
    if (!canDeleteTask(trip, task, userId)) {
      throw new Error('Unauthorized to delete this task');
    }

    task.isArchived = true;
    await task.save();
  }

  /**
   * Mark task as complete for the requesting user
   * Only assigned users can complete
   * 
   * @param taskId The task ID
   * @param userId The user completing the task
   */
  async completeTask(taskId: string, userId: string): Promise<ITask> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const task = await this.getTaskOrThrow(taskId);
    const trip = await this.getTripOrThrow(task.tripId.toString());

    // Check if user can complete this task
    if (!canCompleteTask(trip, task, userId)) {
      throw new Error('Unauthorized to complete this task');
    }

    // Check if already completed by this user
    if (hasUserCompletedTask(task, userId)) {
      throw new Error('Task already completed by this user');
    }

    // Add completion
    task.completions.push({
      userId: new Types.ObjectId(userId),
      completedAt: new Date()
    });

    await task.save();
    
    // Populate before returning
    await task.populate('createdBy', 'username email');
    await task.populate('assignedTo', 'username email');
    await task.populate('completions.userId', 'username email');

    return task;
  }

  /**
   * Remove completion for the requesting user
   * 
   * @param taskId The task ID
   * @param userId The user removing their completion
   */
  async uncompleteTask(taskId: string, userId: string): Promise<ITask> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new Error('Invalid task ID');
    }

    const task = await this.getTaskOrThrow(taskId);
    const trip = await this.getTripOrThrow(task.tripId.toString());

    // Check if user can complete/uncomplete this task
    if (!canCompleteTask(trip, task, userId)) {
      throw new Error('Unauthorized to modify completion for this task');
    }

    // Check if user has completed this task
    if (!hasUserCompletedTask(task, userId)) {
      throw new Error('Task not completed by this user');
    }

    // Remove completion
    const userIdStr = userId.toString();
    task.completions = task.completions.filter(
      completion => completion.userId.toString() !== userIdStr
    );

    await task.save();
    
    // Populate before returning
    await task.populate('createdBy', 'username email');
    await task.populate('assignedTo', 'username email');
    await task.populate('completions.userId', 'username email');

    return task;
  }

  /**
   * Helper: Fetch trip or throw error
   * @private
   */
  private async getTripOrThrow(tripId: string): Promise<ITrip> {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }
    return trip;
  }

  /**
   * Helper: Fetch task or throw error
   * @private
   */
  private async getTaskOrThrow(taskId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }
}

export default new TaskService();

import { Types } from 'mongoose';
import { ITrip } from '../core/trip.model';
import { ITask } from './task.model';
import { isTripCreator, isTripMember } from '../members/member.utils';

/**
 * Task Permissions Module
 * 
 * IMPORTANT SEMANTICS:
 * - assignedTo: null | undefined → assigned to EVERYONE
 * - assignedTo: [] → INVALID (must be rejected at service layer)
 * - Tasks are NEVER public (even for public trips, membership is required)
 * - Task completion is PER USER (not global)
 * 
 * All functions are pure logic (no database calls).
 */

/**
 * Check if user can view tasks in a trip
 * Rule: Any trip member OR trip creator
 */
export function canViewTasks(
  trip: ITrip,
  userId: Types.ObjectId | string
): boolean {
  if (isTripCreator(trip, userId)) return true;
  if (isTripMember(trip, userId)) return true;
  return false;
}

/**
 * Check if user can create a task in a trip
 * Rule: Any trip member OR trip creator
 * 
 * NOTE: This reuses canModifyTripResources semantic temporarily.
 * Task creation is scoped to trip members only.
 */
export function canCreateTask(
  trip: ITrip,
  userId: Types.ObjectId | string
): boolean {
  if (isTripCreator(trip, userId)) return true;
  if (isTripMember(trip, userId)) return true;
  return false;
}

/**
 * Check if user can edit task metadata (title, description, dueDate, assignedTo)
 * Rule: Task creator OR trip creator ONLY
 * Assigned users CANNOT edit metadata
 */
export function canEditTask(
  trip: ITrip,
  task: ITask,
  userId: Types.ObjectId | string
): boolean {
  const userIdStr = userId.toString();
  
  // Trip creator can edit any task
  if (isTripCreator(trip, userId)) return true;
  
  // Task creator can edit their own task
  if (task.createdBy.toString() === userIdStr) return true;

  return false;
}

/**
 * Check if user can delete (archive) a task
 * Rule: Task creator OR trip creator ONLY
 */
export function canDeleteTask(
  trip: ITrip,
  task: ITask,
  userId: Types.ObjectId | string
): boolean {
  const userIdStr = userId.toString();
  
  // Trip creator can delete any task
  if (isTripCreator(trip, userId)) return true;
  
  // Task creator can delete their own task
  if (task.createdBy.toString() === userIdStr) return true;
  
  return false;
}

/**
 * Check if user can complete/uncomplete a task
 * Rule: 
 * - If assignedTo is null/undefined → any trip member
 * - If assignedTo is an array → only users in the array
 */
export function canCompleteTask(
  trip: ITrip,
  task: ITask,
  userId: Types.ObjectId | string
): boolean {
  const userIdStr = userId.toString();
  
  // User must be a trip member to complete tasks
  if (!isTripMember(trip, userId) && !isTripCreator(trip, userId)) {
    return false;
  }
  
  // If assignedTo is null/undefined, any trip member can complete
  if (!task.assignedTo || task.assignedTo.length === 0) {
    return true;
  }
  
  // Check if user is in assignedTo list
  const isAssigned = task.assignedTo.some(
    (assignedUserId) => assignedUserId.toString() === userIdStr
  );
  
  return isAssigned;
}

/**
 * Validate that all assigned users are trip members
 * Rule: All userIds in assignedTo must exist in trip.members
 * 
 * @param trip The trip document
 * @param assignedTo Array of user IDs or null/undefined
 * @returns true if all assigned users are trip members, false otherwise
 */
export function validateAssignedUsers(
  trip: ITrip,
  assignedTo: Types.ObjectId[] | null | undefined
): boolean {
  // null/undefined means "assigned to everyone" → valid
  if (!assignedTo || assignedTo.length === 0) return true;
  
  // Check each assigned user is a trip member
  for (const userId of assignedTo) {
    const userIdStr = userId.toString();
    const isMember = trip.members.some((m: any) => {
      const memberId = (m.userId && typeof m.userId === 'object' && (m.userId as any)._id)
        ? (m.userId as any)._id
        : m.userId;
      return memberId && memberId.toString() === userIdStr;
    });
    
    if (!isMember) return false;
  }
  
  return true;
}

/**
 * Check if user has already completed a task
 * Used to prevent duplicate completions
 */
export function hasUserCompletedTask(
  task: ITask,
  userId: Types.ObjectId | string
): boolean {
  const userIdStr = userId.toString();
  return task.completions.some(
    (completion) => completion.userId.toString() === userIdStr
  );
}

export default {
  canViewTasks,
  canCreateTask,
  canEditTask,
  canDeleteTask,
  canCompleteTask,
  validateAssignedUsers,
  hasUserCompletedTask
};

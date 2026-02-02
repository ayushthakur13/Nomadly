import type { Task, Trip } from '@shared/types';
import { resolveId } from './idNormalizer';

/**
 * Frontend UX-only permission helpers mirroring backend rules
 * These do not hide tasks; they only inform disabled states and tooltips
 * 
 * Permission Model:
 * - Structural fields (title, assignedTo): Trip creator or task creator only
 * - Content fields (description, dueDate): Trip creator, task creator, or assigned members
 * - Delete: Trip creator or task creator only
 * - Complete: Trip members (if assigned or task is for everyone)
 */

export function isTripMember(trip: Trip | null | undefined, userId: string | null): boolean {
  if (!trip || !userId) return false;
  const creatorId = resolveId((trip as any).createdBy);

  // Handle case where members array might not be populated
  if (!trip.members || !Array.isArray(trip.members)) return creatorId === userId;

  const isMember = !!trip.members.find((m: any) => resolveId(m.userId) === userId);
  return isMember || creatorId === userId;
}

function isAssignedToTask(task: Task, userId: string | null): boolean {
  if (!userId) return false;
  // Everyone task (null or empty array)
  if (!task.assignedTo || task.assignedTo.length === 0) return false;
  // Check if user is in assigned list
  return task.assignedTo.includes(userId);
}

/**
 * Can edit structural fields: title, assignedTo
 * Only trip creator or task creator
 */
export function canEditTaskStructure(task: Task, currentUserId: string | null, trip: Trip | null | undefined): boolean {
  if (!currentUserId || !trip) return false;
  const tripCreatorId = resolveId((trip as any).createdBy);
  const taskCreatorId = resolveId((task as any).createdBy);
  return tripCreatorId === currentUserId || taskCreatorId === currentUserId;
}

/**
 * Can edit content fields: description, dueDate
 * Trip creator, task creator, or assigned members
 */
export function canEditTaskContent(task: Task, currentUserId: string | null, trip: Trip | null | undefined): boolean {
  if (!currentUserId || !trip) return false;
  const tripCreatorId = resolveId((trip as any).createdBy);
  const taskCreatorId = resolveId((task as any).createdBy);
  // Trip creator or task creator have full access
  if (tripCreatorId === currentUserId || taskCreatorId === currentUserId) return true;
  // Assigned members can edit content
  return isAssignedToTask(task, currentUserId);
}

/**
 * Can edit task (either structure OR content)
 * Convenience wrapper for UI visibility
 */
export function canEditTask(task: Task, currentUserId: string | null, trip: Trip | null | undefined): boolean {
  return canEditTaskStructure(task, currentUserId, trip) || canEditTaskContent(task, currentUserId, trip);
}

/**
 * Can delete task
 * Only trip creator or task creator
 */
export function canDeleteTask(task: Task, currentUserId: string | null, trip: Trip | null | undefined): boolean {
  if (!currentUserId || !trip) return false;
  const tripCreatorId = resolveId((trip as any).createdBy);
  const taskCreatorId = resolveId((task as any).createdBy);
  return tripCreatorId === currentUserId || taskCreatorId === currentUserId;
}

/**
 * Can complete/uncomplete task
 * Must be trip member AND (assigned to task OR task is for everyone)
 */
export function canCompleteTask(task: Task, currentUserId: string | null, trip: Trip | null | undefined): boolean {
  if (!currentUserId || !trip) return false;
  if (!isTripMember(trip, currentUserId)) return false;
  // assigned to everyone (null or empty array)
  if (!task.assignedTo || task.assignedTo.length === 0) return true;
  // assigned to specific users (already normalized to string[] by service layer)
  return task.assignedTo.includes(currentUserId);
}

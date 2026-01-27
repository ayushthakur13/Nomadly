/**
 * Task domain types - API contract between client and server
 *
 * Semantics:
 * - assignedTo: null | undefined → assigned to EVERYONE
 * - assignedTo: [] → INVALID (must NOT be persisted)
 * - Tasks are NEVER public; membership required to access
 * - Completion is PER USER (not global)
 */

/**
 * Single user completion entry for a task
 */
export interface TaskCompletion {
  userId: string;
  completedAt: string; // ISO datetime string
}

/**
 * Core Task domain model
 */
export interface Task {
  _id: string;
  tripId: string;
  title: string;
  description?: string;
  assignedTo?: string[] | null;
  createdBy: string;
  dueDate?: string; // ISO datetime string
  completions: TaskCompletion[];
  isArchived: boolean;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

/**
 * DTO for creating a new task
 */
export interface CreateTaskDTO {
  title: string;
  description?: string;
  assignedTo?: string[] | null; // null means everyone; [] is invalid and should be normalized/rejected
  dueDate?: string | Date;
}

/**
 * DTO for updating a task
 */
export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  assignedTo?: string[] | null; // null means everyone; [] is invalid and should be normalized/rejected
  dueDate?: string | Date;
}

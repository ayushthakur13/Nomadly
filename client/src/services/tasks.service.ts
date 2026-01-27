import api from './api';
import { extractApiError, type ApiError } from '../utils/errorHandling';

// Import and re-export shared domain types
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '../../../shared/types';
export type { Task };

/**
 * Normalize a single task object from backend
 * Backend populates assignedTo with user objects {_id, username, email}
 * Backend populates createdBy with user object {_id, username, email}
 * Frontend expects array of user ID strings, or null for "everyone"
 */
const normalizeTask = (task: any): Task => {
	if (!task) return task;
	
	// Extract creator name before normalizing createdBy
	let creatorUsername: string | undefined;
	let normalizedCreatedBy = task.createdBy;
	
	if (task.createdBy && typeof task.createdBy === 'object') {
		creatorUsername = task.createdBy.username || task.createdBy.name;
		normalizedCreatedBy = task.createdBy._id || task.createdBy.id;
	}
	
	// Normalize assignedTo: convert populated objects to IDs, and [] to null
	let normalizedAssignedTo: string[] | null = null;
	if (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
		const ids = task.assignedTo
			.map((user: any) => typeof user === 'string' ? user : user._id || user.userId || user)
			.filter(Boolean);
		normalizedAssignedTo = ids.length > 0 ? ids : null;
	}
	
	// Normalize completions: extract user IDs from populated objects
	const normalizedCompletions = (task.completions || []).map((c: any) => ({
		userId: typeof c.userId === 'string' ? c.userId : c.userId?._id || c.userId,
		completedAt: c.completedAt,
	}));
	
	const result: any = {
		...task,
		createdBy: normalizedCreatedBy,
		assignedTo: normalizedAssignedTo,
		completions: normalizedCompletions,
	};
	
	// Store creator username for UI display (not part of Task type, but safe to add)
	if (creatorUsername) {
		result._creatorUsername = creatorUsername;
	}
	
	return result;
};

/**
 * API Response normalization helpers
 * We pass response.data to these functions (the backend JSON response body)
 * Backend structure: { success: true, data: { task/tasks: ... } }
 */
const normalizeTaskResponse = (response: any): Task => {
	// Backend structure: { success: true, data: { task: {...} } }
	let task: any;
	if (response?.data?.task) task = response.data.task;
	else if (response?.task) task = response.task;
	else task = response;
	
	return normalizeTask(task);
};

const normalizeTasksResponse = (response: any): Task[] => {
	// Backend structure: { success: true, data: { tasks: [...] } }
	let tasks: any[];
	if (response?.data?.tasks) tasks = response.data.tasks;
	else if (response?.tasks) tasks = response.tasks;
	else tasks = response;
	
	return (tasks || []).map(normalizeTask);
};

/**
 * Fetch tasks for a trip
 * Optional includeArchived flag (default false)
 */
export async function fetchTasks(tripId: string, includeArchived: boolean = false): Promise<Task[]> {
	try {
		const query = includeArchived ? '?includeArchived=true' : '';
		const res = await api.get(`/trips/${tripId}/tasks${query}`);
		return normalizeTasksResponse(res.data);
	} catch (error) {
		throw new Error(extractApiError(error as ApiError, 'Failed to fetch tasks'));
	}
}

/**
 * Create a new task for a trip
 */
export async function createTask(tripId: string, payload: CreateTaskDTO): Promise<Task> {
	try {
		const res = await api.post(`/trips/${tripId}/tasks`, payload);
		return normalizeTaskResponse(res.data);
	} catch (error) {
		throw new Error(extractApiError(error as ApiError, 'Failed to create task'));
	}
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, payload: Partial<UpdateTaskDTO>): Promise<Task> {
	try {
		const res = await api.patch(`/tasks/${taskId}`, payload);
		return normalizeTaskResponse(res.data);
	} catch (error) {
		throw new Error(extractApiError(error as ApiError, 'Failed to update task'));
	}
}

/**
 * Delete (archive) a task
 */
export async function deleteTask(taskId: string): Promise<void> {
	try {
		await api.delete(`/tasks/${taskId}`);
	} catch (error) {
		throw new Error(extractApiError(error as ApiError, 'Failed to delete task'));
	}
}

/**
 * Mark a task as complete for the current user
 */
export async function completeTask(taskId: string): Promise<Task> {
	try {
		const res = await api.post(`/tasks/${taskId}/complete`);
		return normalizeTaskResponse(res.data);
	} catch (error) {
		throw new Error(extractApiError(error as ApiError, 'Failed to complete task'));
	}
}

/**
 * Remove completion for the current user
 */
export async function uncompleteTask(taskId: string): Promise<Task> {
	try {
		const res = await api.delete(`/tasks/${taskId}/complete`);
		return normalizeTaskResponse(res.data);
	} catch (error) {
		throw new Error(extractApiError(error as ApiError, 'Failed to uncomplete task'));
	}
}

export default {
	fetchTasks,
	createTask,
	updateTask,
	deleteTask,
	completeTask,
	uncompleteTask,
};


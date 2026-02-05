import api from './api';
import { extractApiError, type ApiError } from '../utils/errorHandling';

// Import and re-export shared domain types
import type {
  TripBudget,
  Expense,
  BudgetSnapshot,
  BudgetSummary,
  MemberBudgetSummary,
  CreateBudgetDTO,
  UpdateBudgetDTO,
  UpdateBudgetMemberDTO,
  CreateExpenseDTO,
  UpdateExpenseDTO,
} from '../../../shared/types';

export type {
  TripBudget,
  Expense,
  BudgetSnapshot,
  BudgetSummary,
  MemberBudgetSummary,
};

/**
 * Normalize budget snapshot from backend response
 * Backend structure: { success: true, data: { snapshot: BudgetSnapshot } }
 * Returns the actual BudgetSnapshot object
 */
const normalizeBudgetSnapshot = (response: any): BudgetSnapshot => {
  // Extract snapshot from nested data structure
  const snapshot = response?.data?.snapshot || response?.snapshot || response;
  
  // Verify it's a valid snapshot
  if (snapshot?.budget && snapshot?.expenses !== undefined && snapshot?.summary && snapshot?.memberSummaries !== undefined) {
    return snapshot;
  }
  
  // If response is already a snapshot-like object, return it
  if (response?.budget && response?.expenses !== undefined && response?.summary && response?.memberSummaries !== undefined) {
    return response;
  }
  
  return snapshot || response;
};

/**
 * Fetch complete budget snapshot for a trip
 * Returns: budget config, all expenses, aggregated summaries, and per-member breakdown
 */
export async function fetchBudgetSnapshot(tripId: string): Promise<BudgetSnapshot> {
  try {
    const res = await api.get(`/trips/${tripId}/budget`);
    return normalizeBudgetSnapshot(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to fetch budget'));
  }
}

/**
 * Create budget for a trip
 * Initializes with baseCurrency and optional members with planned contributions
 */
export async function createBudget(
  tripId: string,
  payload: CreateBudgetDTO
): Promise<BudgetSnapshot> {
  try {
    const res = await api.post(`/trips/${tripId}/budget`, payload);
    return normalizeBudgetSnapshot(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to create budget'));
  }
}

/**
 * Update base budget amount (creator only)
 */
export async function updateBaseBudget(
  tripId: string,
  payload: UpdateBudgetDTO
): Promise<BudgetSnapshot> {
  try {
    const res = await api.patch(`/trips/${tripId}/budget`, payload);
    return normalizeBudgetSnapshot(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to update base budget'));
  }
}

/**
 * Update a member's planned contribution
 * Returns updated budget snapshot with recomputed summaries
 */
export async function updateMemberContribution(
  tripId: string,
  userId: string,
  payload: UpdateBudgetMemberDTO
): Promise<BudgetSnapshot> {
  try {
    const res = await api.patch(
      `/trips/${tripId}/budget/members/${userId}`,
      payload
    );
    return normalizeBudgetSnapshot(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to update contribution'));
  }
}

/**
 * Create an expense with splits
 * Backend computes splits based on split method
 * Returns updated budget snapshot with new expense included
 */
export async function createExpense(
  tripId: string,
  payload: CreateExpenseDTO
): Promise<BudgetSnapshot> {
  try {
    const res = await api.post(`/trips/${tripId}/expenses`, payload);
    return normalizeBudgetSnapshot(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to create expense'));
  }
}

/**
 * Update an expense
 * Immutable fields (paidBy, createdBy, splitMethod, tripId) cannot be changed
 * Returns updated budget snapshot with modified expense
 */
export async function updateExpense(
  expenseId: string,
  payload: Partial<UpdateExpenseDTO>
): Promise<BudgetSnapshot> {
  try {
    const res = await api.patch(`/expenses/${expenseId}`, payload);
    return normalizeBudgetSnapshot(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to update expense'));
  }
}

/**
 * Delete an expense
 * Returns updated budget snapshot without the deleted expense
 */
export async function deleteExpense(expenseId: string): Promise<BudgetSnapshot> {
  try {
    const res = await api.delete(`/expenses/${expenseId}`);
    return normalizeBudgetSnapshot(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to delete expense'));
  }
}

export default {
  fetchBudgetSnapshot,
  createBudget,
  updateBaseBudget,
  updateMemberContribution,
  createExpense,
  updateExpense,
  deleteExpense,
};

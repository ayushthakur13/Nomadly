import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchBudgetSnapshot,
  createBudget as apiCreateBudget,
  updateBaseBudget as apiUpdateBaseBudget,
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
  updateMemberContribution as apiUpdateMemberContribution,
} from '@/services/budget.service';
import type {
  BudgetSnapshot,
  CreateBudgetDTO,
  UpdateBudgetDTO,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  UpdateBudgetMemberDTO,
} from '@shared/types';
import { extractApiError, type ApiError } from '@/utils/errorHandling';

/**
 * Helper to wrap async budget actions with consistent error handling
 */
function createBudgetAction(
  apiCall: () => Promise<BudgetSnapshot>,
  errorMessage: string,
  setActionLoading: (value: boolean) => void,
  setError: (value: string | null) => void,
  setSnapshot: (value: BudgetSnapshot) => void,
  onSuccess?: () => void
) {
  return async (): Promise<BudgetSnapshot> => {
    setActionLoading(true);
    setError(null);
    try {
      const newSnapshot = await apiCall();
      setSnapshot(newSnapshot);
      onSuccess?.();
      return newSnapshot;
    } catch (err) {
      const message = extractApiError(err as ApiError, errorMessage);
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  };
}

export function useBudget() {
  const { tripId } = useParams<{ tripId: string }>();

  const [snapshot, setSnapshot] = useState<BudgetSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgetNotFound, setBudgetNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    setBudgetNotFound(false);
    try {
      const data = await fetchBudgetSnapshot(tripId);
      setSnapshot(data);
      setBudgetNotFound(false);
    } catch (err) {
      const errorMessage = extractApiError(err as ApiError, 'Failed to load budget');
      // Check if it's a 404 (budget not found) vs other errors
      if (errorMessage.includes('Budget not found') || errorMessage.includes('not found')) {
        setBudgetNotFound(true);
        setError(null);
      } else {
        setError(errorMessage);
        setBudgetNotFound(false);
      }
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const createBudget = useCallback(
    async (payload: CreateBudgetDTO): Promise<BudgetSnapshot> => {
      if (!tripId) throw new Error('Trip ID is required');
      return createBudgetAction(
        () => apiCreateBudget(tripId, payload),
        'Failed to create budget',
        setActionLoading,
        setError,
        setSnapshot,
        () => setBudgetNotFound(false)
      )();
    },
    [tripId]
  );

  const updateBaseBudget = useCallback(
    async (payload: UpdateBudgetDTO): Promise<BudgetSnapshot> => {
      if (!tripId) throw new Error('Trip ID is required');
      return createBudgetAction(
        () => apiUpdateBaseBudget(tripId, payload),
        'Failed to update base budget',
        setActionLoading,
        setError,
        setSnapshot
      )();
    },
    [tripId]
  );

  const createExpense = useCallback(
    async (payload: CreateExpenseDTO): Promise<BudgetSnapshot> => {
      if (!tripId) throw new Error('Trip ID is required');
      return createBudgetAction(
        () => apiCreateExpense(tripId, payload),
        'Failed to create expense',
        setActionLoading,
        setError,
        setSnapshot
      )();
    },
    [tripId]
  );

  const updateExpense = useCallback(
    async (expenseId: string, payload: UpdateExpenseDTO): Promise<BudgetSnapshot> => {
      return createBudgetAction(
        () => apiUpdateExpense(expenseId, payload),
        'Failed to update expense',
        setActionLoading,
        setError,
        setSnapshot
      )();
    },
    []
  );

  const deleteExpense = useCallback(
    async (expenseId: string): Promise<BudgetSnapshot> => {
      return createBudgetAction(
        () => apiDeleteExpense(expenseId),
        'Failed to delete expense',
        setActionLoading,
        setError,
        setSnapshot
      )();
    },
    []
  );

  const updateMemberContribution = useCallback(
    async (userId: string, payload: UpdateBudgetMemberDTO): Promise<BudgetSnapshot> => {
      if (!tripId) throw new Error('Trip ID is required');
      return createBudgetAction(
        () => apiUpdateMemberContribution(tripId, userId, payload),
        'Failed to update member contribution',
        setActionLoading,
        setError,
        setSnapshot
      )();
    },
    [tripId]
  );

  const clearError = () => setError(null);

  return {
    snapshot,
    loading,
    actionLoading,
    error,
    budgetNotFound,
    createBudget,
    updateBaseBudget,
    createExpense,
    updateExpense,
    deleteExpense,
    updateMemberContribution,
    clearError,
    reload: load,
  };
}

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchBudgetSnapshot,
  createBudget as apiCreateBudget,
  updateBaseBudget as apiUpdateBaseBudget,
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
  updateMemberContribution as apiUpdateMemberContribution,
  bulkUpdateMemberContributions as apiBulkUpdateMemberContributions,
} from '@/services/budget.service';
import type {
  BudgetSnapshot,
  CreateBudgetDTO,
  UpdateBudgetDTO,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  UpdateBudgetMemberDTO,
  BulkUpdateBudgetMembersDTO,
} from '@shared/types';
import { extractApiError, type ApiError } from '@/utils/errorHandling';

interface BudgetContextType {
  snapshot: BudgetSnapshot | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  budgetNotFound: boolean;
  createBudget: (payload: CreateBudgetDTO) => Promise<BudgetSnapshot>;
  updateBaseBudget: (payload: UpdateBudgetDTO) => Promise<BudgetSnapshot>;
  createExpense: (payload: CreateExpenseDTO) => Promise<BudgetSnapshot>;
  updateExpense: (expenseId: string, payload: UpdateExpenseDTO) => Promise<BudgetSnapshot>;
  deleteExpense: (expenseId: string) => Promise<BudgetSnapshot>;
  updateMemberContribution: (userId: string, payload: UpdateBudgetMemberDTO) => Promise<BudgetSnapshot>;
  bulkUpdateMemberContributions: (payload: BulkUpdateBudgetMembersDTO) => Promise<BudgetSnapshot>;
  clearError: () => void;
  reload: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const runAction = useCallback(
    async (
      apiCall: () => Promise<BudgetSnapshot>,
      errorMessage: string,
      onSuccess?: () => void
    ): Promise<BudgetSnapshot> => {
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
    },
    []
  );

  const createBudget = useCallback(
    (payload: CreateBudgetDTO) => {
      if (!tripId) throw new Error('Trip ID is required');
      return runAction(() => apiCreateBudget(tripId, payload), 'Failed to create budget', () =>
        setBudgetNotFound(false)
      );
    },
    [tripId, runAction]
  );

  const updateBaseBudget = useCallback(
    (payload: UpdateBudgetDTO) => {
      if (!tripId) throw new Error('Trip ID is required');
      return runAction(() => apiUpdateBaseBudget(tripId, payload), 'Failed to update base budget');
    },
    [tripId, runAction]
  );

  const createExpense = useCallback(
    (payload: CreateExpenseDTO) => {
      if (!tripId) throw new Error('Trip ID is required');
      return runAction(() => apiCreateExpense(tripId, payload), 'Failed to create expense');
    },
    [tripId, runAction]
  );

  const updateExpense = useCallback(
    (expenseId: string, payload: UpdateExpenseDTO) => {
      return runAction(() => apiUpdateExpense(expenseId, payload), 'Failed to update expense');
    },
    [runAction]
  );

  const deleteExpense = useCallback(
    (expenseId: string) => {
      return runAction(() => apiDeleteExpense(expenseId), 'Failed to delete expense');
    },
    [runAction]
  );

  const updateMemberContribution = useCallback(
    (userId: string, payload: UpdateBudgetMemberDTO) => {
      if (!tripId) throw new Error('Trip ID is required');
      return runAction(
        () => apiUpdateMemberContribution(tripId, userId, payload),
        'Failed to update member contribution'
      );
    },
    [tripId, runAction]
  );

  const bulkUpdateMemberContributions = useCallback(
    (payload: BulkUpdateBudgetMembersDTO) => {
      if (!tripId) throw new Error('Trip ID is required');
      return runAction(
        () => apiBulkUpdateMemberContributions(tripId, payload),
        'Failed to update contributions'
      );
    },
    [tripId, runAction]
  );

  const clearError = useCallback(() => setError(null), []);

  return React.createElement(
    BudgetContext.Provider,
    {
      value: {
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
        bulkUpdateMemberContributions,
        clearError,
        reload: load,
      },
    },
    children
  );
};

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}

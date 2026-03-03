import { useMemo } from 'react';
import type { BudgetSnapshot } from '@shared/types';
import { useCurrentUserId } from '@/features/auth/hooks/';

interface BudgetPermissions {
  isCreator: boolean;
  canAddExpense: boolean;
  canEditBaseBudget: boolean;
  canEditContribution: (userId: string) => boolean;
}

/**
 * Unified hook for all budget-related permission checks
 * Centralizes creator, expense, and contribution edit permissions
 */
export function useBudgetPermissions(snapshot: BudgetSnapshot | null): BudgetPermissions {
  const currentUserId = useCurrentUserId();

  return useMemo(() => {
    if (!snapshot || !currentUserId) {
      return {
        isCreator: false,
        canAddExpense: false,
        canEditBaseBudget: false,
        canEditContribution: () => false,
      };
    }

    const budget = snapshot.budget;
    const currentMember = budget.members.find((m) => m.userId === currentUserId);

    /**
     * Normalize IDs to plain trimmed strings before comparison.
     * Both createdBy and currentUserId arrive as strings from the API,
     * but this guard prevents silent mismatches from extra whitespace or
     * ObjectId objects leaking through in tests/stubs.
     */
    const toId = (v: unknown): string => String(v ?? '').trim();
    const isCreator = Boolean(
      currentUserId && toId(budget.createdBy) === toId(currentUserId)
    );

    // Can add expense if creator OR active member with permission
    const canAddExpense = Boolean(
      isCreator ||
        (currentMember &&
          !currentMember.isPastMember &&
          (budget.rules?.allowMemberExpenseCreation ?? true))
    );

    // Only creators can edit base budget
    const canEditBaseBudget = isCreator;

    // Can edit contribution if creator, or self with permission
    const canEditContribution = (userId: string): boolean => {
      if (isCreator) return true;
      if (toId(userId) !== toId(currentUserId)) return false;

      const memberMeta = budget.members.find((m) => m.userId === userId);
      if (!memberMeta || memberMeta.isPastMember) return false;

      return budget.rules?.allowMemberContributionEdits ?? true;
    };

    return {
      isCreator,
      canAddExpense,
      canEditBaseBudget,
      canEditContribution,
    };
  }, [snapshot, currentUserId]);
}

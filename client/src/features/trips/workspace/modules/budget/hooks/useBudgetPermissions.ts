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

    // Creator check: compare as strings to handle ObjectId vs string
    const isCreator = Boolean(
      budget.createdBy && String(budget.createdBy) === String(currentUserId)
    );

    // Can add expense if creator OR member with permission
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
      if (userId !== currentUserId) return false;

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

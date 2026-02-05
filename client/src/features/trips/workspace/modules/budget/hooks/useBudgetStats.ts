import { useMemo } from 'react';
import type { BudgetSnapshot, Expense } from '@shared/types';

/**
 * Budget statistics hook - derived data and calculations from snapshot
 * Follows pattern from useTaskStats.ts
 */
export function useBudgetStats(snapshot: BudgetSnapshot | null) {
  const stats = useMemo(() => {
    if (!snapshot) {
      return {
        totalExpenses: 0,
        expensesByCategory: {},
        expensesByMember: {},
        averageExpenseAmount: 0,
        largestExpense: null as Expense | null,
        recentExpenses: [] as Expense[],
      };
    }

    const { expenses } = snapshot;

    // Group by category
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((expense) => {
      const category = expense.category || 'Uncategorized';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + expense.amount;
    });

    // Group by member (who paid)
    const expensesByMember: Record<string, { count: number; total: number }> = {};
    expenses.forEach((expense) => {
      if (!expensesByMember[expense.paidBy]) {
        expensesByMember[expense.paidBy] = { count: 0, total: 0 };
      }
      expensesByMember[expense.paidBy].count += 1;
      expensesByMember[expense.paidBy].total += expense.amount;
    });

    // Average expense amount
    const averageExpenseAmount =
      expenses.length > 0
        ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length
        : 0;

    // Largest expense
    const largestExpense =
      expenses.length > 0
        ? expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0])
        : null;

    // Recent expenses (last 5)
    const recentExpenses = expenses.slice(0, 5);

    return {
      totalExpenses: expenses.length,
      expensesByCategory,
      expensesByMember,
      averageExpenseAmount,
      largestExpense,
      recentExpenses,
    };
  }, [snapshot]);

  return stats;
}

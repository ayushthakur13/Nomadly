import { useState, useMemo } from 'react';
import type { Expense } from '@shared/types';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

/**
 * Budget filters hook - for filtering and sorting expenses
 * Follows pattern from useTaskFilters.ts
 */
export function useBudgetFilters(expenses: Expense[]) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState<string | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(
        (e) => (e.category || 'Uncategorized') === categoryFilter
      );
    }

    // Filter by member (paidBy)
    if (memberFilter) {
      filtered = filtered.filter((e) => e.paidBy === memberFilter);
    }

    // Filter by date range
    if (dateRangeFilter.start || dateRangeFilter.end) {
      filtered = filtered.filter((e) => {
        const expenseDate = new Date(e.date);
        if (dateRangeFilter.start && expenseDate < new Date(dateRangeFilter.start)) {
          return false;
        }
        if (dateRangeFilter.end && expenseDate > new Date(dateRangeFilter.end)) {
          return false;
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [expenses, categoryFilter, memberFilter, dateRangeFilter, sortBy]);

  const clearFilters = () => {
    setCategoryFilter(null);
    setMemberFilter(null);
    setDateRangeFilter({ start: null, end: null });
  };

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    expenses.forEach((e) => categories.add(e.category || 'Uncategorized'));
    return Array.from(categories).sort();
  }, [expenses]);

  const availableMembers = useMemo(() => {
    const members = new Set<string>();
    expenses.forEach((e) => members.add(e.paidBy));
    return Array.from(members);
  }, [expenses]);

  return {
    filteredExpenses,
    categoryFilter,
    setCategoryFilter,
    memberFilter,
    setMemberFilter,
    dateRangeFilter,
    setDateRangeFilter,
    sortBy,
    setSortBy,
    clearFilters,
    availableCategories,
    availableMembers,
  };
}

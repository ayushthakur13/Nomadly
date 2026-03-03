/**
 * Budget module constants
 */

/** Predefined expense categories for travel planning */
export const EXPENSE_CATEGORIES = [
  'Accommodation',
  'Food & Drinks',
  'Transport',
  'Activities',
  'Shopping',
  'Entertainment',
  'Health',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** Human-readable labels for expense split methods */
export const SPLIT_METHOD_LABELS: Record<string, string> = {
  equal: 'Fair Split',
  custom: 'Custom Amounts',
};

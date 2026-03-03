/**
 * Shared formatting utilities for budget and financial displays
 */

export const CATEGORY_DOT: Record<string, string> = {
  'Food & Drinks': 'bg-orange-400',
  Transport: 'bg-sky-400',
  Accommodation: 'bg-violet-400',
  Activities: 'bg-emerald-400',
  Shopping: 'bg-pink-400',
  Health: 'bg-red-400',
  Entertainment: 'bg-yellow-400',
  Other: 'bg-gray-300',
};

export function getCategoryDot(category?: string): string {
  if (!category) return CATEGORY_DOT['Other'];
  return CATEGORY_DOT[category] ?? 'bg-gray-300';
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

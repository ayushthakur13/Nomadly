import { useMemo } from 'react';

/**
 * Formats trip date range (e.g., "Jan 15 – Feb 20, 2025").
 * Pure compute only—no side effects.
 */
export const useTripDateRange = (startDate: string, endDate: string) => {
  const formattedDateRange = useMemo(() => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} – ${end}`;
  }, [startDate, endDate]);

  return { formattedDateRange };
};

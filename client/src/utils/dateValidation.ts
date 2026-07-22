/**
 * Utility to validate if a return/end date is chronologically before a departure/start date.
 * Returns true if the end date is invalid (i.e. before the start date).
 */
export const isDateRangeInvalid = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): boolean => {
  if (!startDate || !endDate) return false;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Align both dates to midnight local time for robust day-only comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return end < start;
};

/**
 * Checks if a single date falls outside a trip's start/end boundary (inclusive).
 * Returns true if the date is out of bounds.
 */
export const isDateOutOfBounds = (
  date: string | Date | null | undefined,
  tripStartDate: string | Date | null | undefined,
  tripEndDate: string | Date | null | undefined
): boolean => {
  if (!date || !tripStartDate || !tripEndDate) return false;

  const target = new Date(date);
  const start = new Date(tripStartDate);
  const end = new Date(tripEndDate);

  target.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return target < start || target > end;
};

/**
 * Checks if a date range (e.g. check-in & check-out, arrival & departure) falls outside trip dates.
 * Returns true if either date is out of bounds.
 */
export const isDateRangeOutOfBounds = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  tripStartDate: string | Date | null | undefined,
  tripEndDate: string | Date | null | undefined
): boolean => {
  return (
    isDateOutOfBounds(startDate, tripStartDate, tripEndDate) ||
    isDateOutOfBounds(endDate, tripStartDate, tripEndDate)
  );
};

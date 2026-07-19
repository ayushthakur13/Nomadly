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

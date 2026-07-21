/**
 * Formats a start date and an end date into a localized string range.
 * Example: Dec 1-11, 2025 or Dec 1 - Jan 5, 2026
 */
export const formatDateRange = (startDate: string | Date, endDate?: string | Date): string => {
  const start = new Date(startDate);
  
  if (!endDate || String(startDate) === String(endDate)) {
    return start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const end = new Date(endDate);
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();

  if (startMonth === endMonth) {
    if (startDay === endDay) {
      return `${startMonth} ${startDay}, ${year}`;
    }
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
};
